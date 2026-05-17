'use client';
import { Editor as TinyEditor } from '@tinymce/tinymce-react';

type TinyMceEditorProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
  disabled?: boolean;
};

const plugins = [
  'advlist',
  'autolink',
  'lists',
  'link',
  'image',
  'charmap',
  'preview',
  'anchor',
  'searchreplace',
  'visualblocks',
  'code',
  'fullscreen',
  'insertdatetime',
  'media',
  'table',
  'wordcount',
  'help',
  'emoticons',
  'template',
  'pagebreak',
  'nonbreaking',
  'quickbars',
  'autoresize',
  'autosave',
  'save',
  'directionality',
  'codesample',
  'importcss',
  'visualchars',
];

const toolbar =
  'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough forecolor backcolor removeformat | alignleft aligncenter alignright alignjustify | outdent indent | bullist numlist checklist | link image media table charmap emoticons | pagebreak insertdatetime template | hr blockquote codesample | ltr rtl | searchreplace visualblocks preview fullscreen code | help';

export default function TinyMceEditor({
  value,
  onChange,
  label,
  helperText,
  disabled = false,
}: TinyMceEditorProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
          {label}
        </label>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-2">
        <TinyEditor
          apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'no-api-key'}
          value={value}
          disabled={disabled}
          onEditorChange={onChange}
          init={{
            height: 420,
            menubar: 'file edit view insert format tools table help',
            plugins,
            toolbar,
            toolbar_sticky: true,
            toolbar_mode: 'sliding',
            statusbar: true,
            branding: false,
            promotion: false,
            resize: true,
            elementpath: true,
            browser_spellcheck: true,
            contextmenu: 'undo redo | link image media table | cut copy paste',
            quickbars_selection_toolbar: 'bold italic underline | quicklink h2 h3 blockquote',
            quickbars_insert_toolbar: 'quickimage quicktable',
            autosave_ask_before_unload: true,
            autosave_interval: '30s',
            autosave_restore_when_empty: true,
            image_advtab: true,
            image_caption: true,
            image_title: true,
            automatic_uploads: true,
            paste_data_images: true,
            link_assume_external_targets: true,
            link_default_target: '_blank',
            default_link_target: '_blank',
            table_default_attributes: { border: '1' },
            table_default_styles: {
              borderCollapse: 'collapse',
              width: '100%',
            },
            table_toolbar:
              'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
            style_formats: [
              { title: 'Headers', items: [{ title: 'Heading 2', format: 'h2' }, { title: 'Heading 3', format: 'h3' }, { title: 'Heading 4', format: 'h4' }] },
              { title: 'Inline', items: [{ title: 'Bold', format: 'bold' }, { title: 'Italic', format: 'italic' }, { title: 'Underline', format: 'underline' }, { title: 'Strikethrough', format: 'strikethrough' }, { title: 'Code', format: 'code' }] },
              { title: 'Blocks', items: [{ title: 'Paragraph', format: 'p' }, { title: 'Blockquote', format: 'blockquote' }, { title: 'Div', format: 'div' }, { title: 'Pre', format: 'pre' }] },
              { title: 'Alignment', items: [{ title: 'Left', format: 'alignleft' }, { title: 'Center', format: 'aligncenter' }, { title: 'Right', format: 'alignright' }, { title: 'Justify', format: 'alignjustify' }] },
            ],
            content_style:
              'body { font-family: Inter, Arial, sans-serif; font-size: 14px; line-height: 1.6; padding: 8px; } img { max-width: 100%; height: auto; } table { border-collapse: collapse; width: 100%; } table td, table th { border: 1px solid #d1d5db; padding: 8px; }',
          }}
        />
      </div>

      {helperText && (
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter ml-1">
          {helperText}
        </p>
      )}
    </div>
  );
}
