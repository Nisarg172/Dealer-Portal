import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

const REQUIRED_HEADERS = ['name', 'category_id', 'base_price', 'purchase_price'] as const;

type RowError = {
  row: number;
  message: string;
};

type ParsedProductRow = {
  row: number;
  name: string;
  normalizedName: string;
  categoryId: string;
  basePrice: number;
  purchasePrice: number;
  description: string | null;
  datasheetUrl: string | null;
  productUrl: string | null;
  isActive: boolean;
};

const normalizeCellValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
};

const normalizeHeader = (value: unknown): string => {
  return normalizeCellValue(value).toLowerCase();
};

const parseNumber = (value: unknown): number | null => {
  const parsedValue = normalizeCellValue(value).replace(/,/g, '');

  if (!parsedValue) {
    return null;
  }

  const number = Number(parsedValue);
  if (!Number.isFinite(number)) {
    return null;
  }

  return number;
};

const parseOptionalStatus = (value: unknown): boolean | null => {
  const normalizedStatus = normalizeCellValue(value).toLowerCase();

  if (!normalizedStatus) {
    return true;
  }

  if (['active', 'true', '1', 'yes'].includes(normalizedStatus)) {
    return true;
  }

  if (['inactive', 'false', '0', 'no'].includes(normalizedStatus)) {
    return false;
  }

  return null;
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const uploadedFile = formData.get('file');

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json(
        { error: 'Excel file is required.' },
        { status: 400 }
      );
    }

    const lowerCaseFileName = uploadedFile.name.toLowerCase();
    const hasSupportedExtension =
      lowerCaseFileName.endsWith('.xlsx') ||
      lowerCaseFileName.endsWith('.xls') ||
      lowerCaseFileName.endsWith('.csv');

    if (!hasSupportedExtension) {
      return NextResponse.json(
        { error: 'Only .xlsx, .xls, and .csv files are supported.' },
        { status: 400 }
      );
    }

    const fileBuffer = await uploadedFile.arrayBuffer();
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      return NextResponse.json(
        { error: 'Uploaded file does not contain any worksheet.' },
        { status: 400 }
      );
    }

    const firstSheet = workbook.Sheets[firstSheetName];
    const sheetRows = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, {
      header: 1,
      defval: '',
      blankrows: false,
      raw: false,
    });

    if (sheetRows.length === 0) {
      return NextResponse.json(
        { error: 'Uploaded file is empty.' },
        { status: 400 }
      );
    }

    const rawHeaderRow = sheetRows[0];
    if (!Array.isArray(rawHeaderRow)) {
      return NextResponse.json(
        { error: 'Invalid header row in uploaded file.' },
        { status: 400 }
      );
    }

    const headerIndexMap = new Map<string, number>();
    rawHeaderRow.forEach((headerCell, index) => {
      const normalized = normalizeHeader(headerCell);
      if (normalized && !headerIndexMap.has(normalized)) {
        headerIndexMap.set(normalized, index);
      }
    });

    const missingHeaders = REQUIRED_HEADERS.filter(
      (header) => !headerIndexMap.has(header)
    );

    if (missingHeaders.length > 0) {
      return NextResponse.json(
        { error: `Missing required columns: ${missingHeaders.join(', ')}` },
        { status: 400 }
      );
    }

    const { data: categoryRecords, error: categoryError } = await supabase
      .from('categories')
      .select('id, name')
      .is('deleted_at', null);

    if (categoryError) {
      return NextResponse.json(
        { error: categoryError.message },
        { status: 500 }
      );
    }

    const categoryById = new Map<string, string>();
    const categoryByName = new Map<string, string>();

    for (const category of categoryRecords ?? []) {
      const normalizedId = normalizeCellValue(category.id).toLowerCase();
      const normalizedName = normalizeCellValue(category.name).toLowerCase();

      if (normalizedId) {
        categoryById.set(normalizedId, category.id);
      }
      if (normalizedName) {
        categoryByName.set(normalizedName, category.id);
      }
    }

    const { data: existingProductRecords, error: existingProductsError } = await supabase
      .from('products')
      .select('name')
      .is('deleted_at', null);

    if (existingProductsError) {
      return NextResponse.json(
        { error: existingProductsError.message },
        { status: 500 }
      );
    }

    const existingProductNames = new Set(
      (existingProductRecords ?? [])
        .map((product) => normalizeCellValue(product.name).toLowerCase())
        .filter(Boolean)
    );

    const fileLevelProductNames = new Set<string>();
    const rowErrors: RowError[] = [];
    const parsedRows: ParsedProductRow[] = [];
    let processedRows = 0;
    let duplicatesSkipped = 0;

    for (let rowIndex = 1; rowIndex < sheetRows.length; rowIndex += 1) {
      const currentRow = sheetRows[rowIndex];
      const rowNumber = rowIndex + 1;
      const rowCells = Array.isArray(currentRow) ? currentRow : [];
      const isEmptyRow = rowCells.every((cell) => normalizeCellValue(cell) === '');

      if (isEmptyRow) {
        continue;
      }

      processedRows += 1;

      const getValueByHeader = (headerName: string): unknown => {
        const cellIndex = headerIndexMap.get(headerName);
        if (cellIndex === undefined) {
          return '';
        }
        return rowCells[cellIndex];
      };

      const name = normalizeCellValue(getValueByHeader('name'));
      const categoryInput = normalizeCellValue(getValueByHeader('category_id'));
      const basePrice = parseNumber(getValueByHeader('base_price'));
      const purchasePrice = parseNumber(getValueByHeader('purchase_price'));
      const description = normalizeCellValue(getValueByHeader('description')) || null;
      const datasheetUrl = normalizeCellValue(getValueByHeader('datasheet_url')) || null;
      const productUrl = normalizeCellValue(getValueByHeader('product_url')) || null;
      const parsedStatus = parseOptionalStatus(getValueByHeader('status'));

      const missingValues: string[] = [];
      if (!name) missingValues.push('name');
      if (!categoryInput) missingValues.push('category_id');
      if (basePrice === null) missingValues.push('base_price');
      if (purchasePrice === null) missingValues.push('purchase_price');

      if (missingValues.length > 0) {
        rowErrors.push({
          row: rowNumber,
          message: `Missing required value(s): ${missingValues.join(', ')}`,
        });
        continue;
      }

      if (basePrice === null || purchasePrice === null) {
        rowErrors.push({
          row: rowNumber,
          message: 'base_price and purchase_price must be valid numbers.',
        });
        continue;
      }

      if (basePrice < 0 || purchasePrice < 0) {
        rowErrors.push({
          row: rowNumber,
          message: 'base_price and purchase_price must be zero or greater.',
        });
        continue;
      }

      if (parsedStatus === null) {
        rowErrors.push({
          row: rowNumber,
          message: "Invalid status value. Use 'active' or 'inactive' when provided.",
        });
        continue;
      }

      const normalizedCategoryInput = categoryInput.toLowerCase();
      const categoryId =
        categoryById.get(normalizedCategoryInput) ||
        categoryByName.get(normalizedCategoryInput);

      if (!categoryId) {
        rowErrors.push({
          row: rowNumber,
          message: `Category not found for value '${categoryInput}'.`,
        });
        continue;
      }

      const normalizedName = name.toLowerCase();
      if (
        existingProductNames.has(normalizedName) ||
        fileLevelProductNames.has(normalizedName)
      ) {
        duplicatesSkipped += 1;
        rowErrors.push({
          row: rowNumber,
          message: `Product '${name}' already exists; row skipped.`,
        });
        continue;
      }

      fileLevelProductNames.add(normalizedName);
      parsedRows.push({
        row: rowNumber,
        name,
        normalizedName,
        categoryId,
        basePrice,
        purchasePrice,
        description,
        datasheetUrl,
        productUrl,
        isActive: parsedStatus,
      });
    }

    if (processedRows === 0) {
      return NextResponse.json(
        { error: 'No data rows found in the uploaded sheet.' },
        { status: 400 }
      );
    }

    let importedCount = 0;

    for (const parsedRow of parsedRows) {
      const { error: insertError } = await supabase.from('products').insert({
        name: parsedRow.name,
        category_id: parsedRow.categoryId,
        base_price: parsedRow.basePrice,
        purchase_price: parsedRow.purchasePrice,
        description: parsedRow.description,
        datasheet_url: parsedRow.datasheetUrl,
        product_url: parsedRow.productUrl,
        is_active: parsedRow.isActive,
      });

      if (insertError) {
        rowErrors.push({
          row: parsedRow.row,
          message: insertError.message,
        });
        continue;
      }

      importedCount += 1;
      existingProductNames.add(parsedRow.normalizedName);
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalRows: processedRows,
        imported: importedCount,
        skipped: rowErrors.length,
        duplicatesSkipped,
        validationSkipped: rowErrors.length - duplicatesSkipped,
      },
      errors: rowErrors,
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
