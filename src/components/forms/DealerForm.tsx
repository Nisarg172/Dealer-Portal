'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import api from '@/lib/axios';
import { useState } from 'react';

interface DealerFormInputs {
  name: string;
  email?: string;
  phone?: string;
  company_name: string;
  address?: string;
  password?: string; // Only for creation, not update
}

interface DealerFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: DealerFormInputs; // For editing existing dealers
  isEditMode?: boolean;
}

export default function DealerForm({
  onSuccess,
  onCancel,
  initialData,
  isEditMode = false,
}: DealerFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<DealerFormInputs>({
    defaultValues: initialData,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit: SubmitHandler<DealerFormInputs> = async (data) => {
    setLoading(true);
    setSubmitError(null);
    try {
      if (isEditMode) {
        // Assuming an update endpoint like /admin/dealers/[id]
        await api.put(`/admin/dealers/${(initialData as any).id}`, data);
      } else {
        await api.post('/admin/dealers', data);
      }
      onSuccess();
    } catch (err: any) {
      console.error('Form submission error:', err);
      setSubmitError(err.response?.data?.error || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          id="name"
          {...register('name', { required: 'Name is required' })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">Company Name</label>
        <input
          type="text"
          id="company_name"
          {...register('company_name', { required: 'Company name is required' })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
        {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          id="email"
          {...register('email', { 
            pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }
          })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
        <input
          type="text"
          id="phone"
          {...register('phone')}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
        <input
          type="text"
          id="address"
          {...register('address')}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
      </div>

      {!isEditMode && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            {...register('password', { required: 'Password is required' })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>
      )}

      {submitError && <p className="text-red-500 text-sm mt-4">{submitError}</p>}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : (isEditMode ? 'Update Dealer' : 'Create Dealer')}
        </button>
      </div>
    </form>
  );
}

