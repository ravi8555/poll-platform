// // frontend/src/pages/CreatePollPage.tsx - Complete Working Version
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useForm, useFieldArray } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import toast from 'react-hot-toast';
// import { pollService } from '../services/pollService';
// import { PlusIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

// // Form validation schema
// const pollFormSchema = z.object({
//   title: z.string().min(3, 'Title must be at least 3 characters').max(200),
//   description: z.string().optional(),
//   questions: z.array(z.object({
//     text: z.string().min(1, 'Question text is required'),
//     isMandatory: z.boolean().default(false),
//     options: z.array(z.object({
//       text: z.string().min(1, 'Option text is required'),
//     })).min(2, 'At least 2 options required'),
//   })).min(1, 'At least one question required'),
//   expiryDate: z.string().min(1, 'Expiry date is required'),
//   responseMode: z.enum(['anonymous', 'authenticated']),
// });

// type PollFormData = z.infer<typeof pollFormSchema>;

// export const CreatePollPage: React.FC = () => {
//   const navigate = useNavigate();
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const {
//     register,
//     control,
//     handleSubmit,
//     formState: { errors },
//     watch,
//     setValue,
//     getValues,
//   } = useForm<PollFormData>({
//     resolver: zodResolver(pollFormSchema),
//     defaultValues: {
//       title: '',
//       description: '',
//       questions: [
//         {
//           text: '',
//           isMandatory: true,
//           options: [{ text: '' }, { text: '' }],
//         },
//       ],
//       expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
//       responseMode: 'anonymous',
//     },
//   });

//   const { fields: questionFields, append: appendQuestion, remove: removeQuestion, move: moveQuestion } = useFieldArray({
//     control,
//     name: 'questions',
//   });

//   const addOptionToQuestion = (questionIndex: number) => {
//     const currentOptions = getValues(`questions.${questionIndex}.options`) || [];
//     setValue(`questions.${questionIndex}.options`, [...currentOptions, { text: '' }]);
//   };

//   const removeOptionFromQuestion = (questionIndex: number, optionIndex: number) => {
//     const currentOptions = getValues(`questions.${questionIndex}.options`);
//     const newOptions = currentOptions.filter((_, idx) => idx !== optionIndex);
//     setValue(`questions.${questionIndex}.options`, newOptions);
//   };

//   const addQuestion = () => {
//     appendQuestion({
//       text: '',
//       isMandatory: true,
//       options: [{ text: '' }, { text: '' }],
//     });
//   };

//   const onSubmit = async (data: PollFormData) => {
//     setIsSubmitting(true);
//     try {
//       // Format data for API
//       const pollData = {
//         title: data.title,
//         description: data.description,
//         questions: data.questions.map((q, qIndex) => ({
//           text: q.text,
//           type: 'single-select' as const,
//           isMandatory: q.isMandatory,
//           order: qIndex,
//           options: q.options.map((opt, optIndex) => ({
//             text: opt.text,
//             order: optIndex,
//           })),
//         })),
//         expiryDate: new Date(data.expiryDate).toISOString(),
//         responseMode: data.responseMode,
//       };

//       console.log('Submitting poll:', pollData);
//       const result = await pollService.createPoll(pollData);
//       toast.success('Poll created successfully!');
//       navigate('/dashboard');
//     } catch (error: any) {
//       console.error('Create poll error:', error);
//       toast.error(error.response?.data?.error || 'Failed to create poll');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto px-4 py-8">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">Create New Poll</h1>
//         <p className="mt-2 text-gray-600">Create your poll with multiple questions and options</p>
//       </div>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//         {/* Poll Title */}
//         <div className="bg-white rounded-lg shadow p-6">
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Poll Title <span className="text-red-500">*</span>
//           </label>
//           <input
//             type="text"
//             {...register('title')}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//             placeholder="Enter poll title"
//           />
//           {errors.title && (
//             <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
//           )}
//         </div>

//         {/* Poll Description */}
//         <div className="bg-white rounded-lg shadow p-6">
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Description (Optional)
//           </label>
//           <textarea
//             {...register('description')}
//             rows={3}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//             placeholder="Describe your poll"
//           />
//         </div>

//         {/* Response Mode */}
//         <div className="bg-white rounded-lg shadow p-6">
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Response Mode
//           </label>
//           <div className="space-y-2">
//             <label className="flex items-center">
//               <input
//                 type="radio"
//                 value="anonymous"
//                 {...register('responseMode')}
//                 className="h-4 w-4 text-indigo-600"
//               />
//               <span className="ml-2 text-sm text-gray-700">Anonymous (Anyone can respond)</span>
//             </label>
//             <label className="flex items-center">
//               <input
//                 type="radio"
//                 value="authenticated"
//                 {...register('responseMode')}
//                 className="h-4 w-4 text-indigo-600"
//               />
//               <span className="ml-2 text-sm text-gray-700">Authenticated (Login required)</span>
//             </label>
//           </div>
//         </div>

//         {/* Expiry Date */}
//         <div className="bg-white rounded-lg shadow p-6">
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Expiry Date & Time <span className="text-red-500">*</span>
//           </label>
//           <input
//             type="datetime-local"
//             {...register('expiryDate')}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//           />
//           {errors.expiryDate && (
//             <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
//           )}
//         </div>

//         {/* Questions Section */}
//         <div className="space-y-4">
//           <div className="flex justify-between items-center">
//             <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
//             <button
//               type="button"
//               onClick={addQuestion}
//               className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
//             >
//               <PlusIcon className="h-4 w-4 mr-1" />
//               Add Question
//             </button>
//           </div>

//           {errors.questions && (
//             <p className="text-sm text-red-600">{errors.questions.message}</p>
//           )}

//           {questionFields.map((field, qIndex) => (
//             <div key={field.id} className="bg-white rounded-lg shadow p-6">
//               <div className="flex justify-between items-start mb-4">
//                 <h3 className="text-lg font-medium text-gray-900">
//                   Question {qIndex + 1}
//                 </h3>
//                 <div className="flex space-x-2">
//                   {qIndex > 0 && (
//                     <button
//                       type="button"
//                       onClick={() => moveQuestion(qIndex, qIndex - 1)}
//                       className="text-gray-400 hover:text-gray-600"
//                     >
//                       <ChevronUpIcon className="h-5 w-5" />
//                     </button>
//                   )}
//                   {qIndex < questionFields.length - 1 && (
//                     <button
//                       type="button"
//                       onClick={() => moveQuestion(qIndex, qIndex + 1)}
//                       className="text-gray-400 hover:text-gray-600"
//                     >
//                       <ChevronDownIcon className="h-5 w-5" />
//                     </button>
//                   )}
//                   <button
//                     type="button"
//                     onClick={() => removeQuestion(qIndex)}
//                     className="text-red-400 hover:text-red-600"
//                   >
//                     <TrashIcon className="h-5 w-5" />
//                   </button>
//                 </div>
//               </div>

//               {/* Question Text */}
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Question Text <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   {...register(`questions.${qIndex}.text`)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                   placeholder="Enter your question"
//                 />
//                 {errors.questions?.[qIndex]?.text && (
//                   <p className="mt-1 text-sm text-red-600">{errors.questions[qIndex]?.text?.message}</p>
//                 )}
//               </div>

//               {/* Mandatory Toggle */}
//               <div className="mb-4">
//                 <label className="flex items-center">
//                   <input
//                     type="checkbox"
//                     {...register(`questions.${qIndex}.isMandatory`)}
//                     className="h-4 w-4 text-indigo-600 rounded"
//                   />
//                   <span className="ml-2 text-sm text-gray-700">Mandatory question</span>
//                 </label>
//               </div>

//               {/* Options Section */}
//               <div>
//                 <div className="flex justify-between items-center mb-3">
//                   <label className="block text-sm font-medium text-gray-700">
//                     Options <span className="text-red-500">*</span>
//                   </label>
//                   <button
//                     type="button"
//                     onClick={() => addOptionToQuestion(qIndex)}
//                     className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700"
//                   >
//                     <PlusIcon className="h-4 w-4 mr-1" />
//                     Add Option
//                   </button>
//                 </div>

//                 <div className="space-y-2">
//                   {watch(`questions.${qIndex}.options`)?.map((_, optIndex) => (
//                     <div key={optIndex} className="flex items-center space-x-2">
//                       <div className="flex-1">
//                         <input
//                           type="text"
//                           {...register(`questions.${qIndex}.options.${optIndex}.text`)}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
//                           placeholder={`Option ${optIndex + 1}`}
//                         />
//                       </div>
//                       {watch(`questions.${qIndex}.options`)?.length > 2 && (
//                         <button
//                           type="button"
//                           onClick={() => removeOptionFromQuestion(qIndex, optIndex)}
//                           className="text-red-400 hover:text-red-600"
//                         >
//                           <TrashIcon className="h-5 w-5" />
//                         </button>
//                       )}
//                     </div>
//                   ))}
//                 </div>

//                 {errors.questions?.[qIndex]?.options && (
//                   <p className="mt-2 text-sm text-red-600">
//                     {errors.questions[qIndex]?.options?.message}
//                   </p>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Submit Buttons */}
//         <div className="flex justify-end space-x-4">
//           <button
//             type="button"
//             onClick={() => navigate('/dashboard')}
//             className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
//           >
//             {isSubmitting ? 'Creating...' : 'Create Poll'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };


// frontend/src/pages/CreatePollPage.tsx - Fixed TypeScript errors
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { pollService } from '../services/pollService';
import { PlusIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

// Form validation schema - all fields explicitly required
const optionSchema = z.object({
  text: z.string().min(1, 'Option text is required'),
});

const questionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  isMandatory: z.boolean(),
  options: z.array(optionSchema).min(2, 'At least 2 options required'),
});

const pollFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1, 'At least one question required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  responseMode: z.enum(['anonymous', 'authenticated']),
});

type PollFormData = z.infer<typeof pollFormSchema>;

export const CreatePollPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm<PollFormData>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: {
      title: '',
      description: '',
      questions: [
        {
          text: '',
          isMandatory: true,
          options: [{ text: '' }, { text: '' }],
        },
      ],
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      responseMode: 'anonymous',
    },
  });

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion, move: moveQuestion } = useFieldArray({
    control,
    name: 'questions',
  });

  const addOptionToQuestion = (questionIndex: number) => {
    const currentOptions = getValues(`questions.${questionIndex}.options`) || [];
    setValue(`questions.${questionIndex}.options`, [...currentOptions, { text: '' }]);
  };

  const removeOptionFromQuestion = (questionIndex: number, optionIndex: number) => {
    const currentOptions = getValues(`questions.${questionIndex}.options`);
    const newOptions = currentOptions.filter((_: any, idx: number) => idx !== optionIndex);
    setValue(`questions.${questionIndex}.options`, newOptions);
  };

  const addQuestion = () => {
    appendQuestion({
      text: '',
      isMandatory: true,
      options: [{ text: '' }, { text: '' }],
    });
  };

  const onSubmit: SubmitHandler<PollFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      // Format data for API
      const pollData = {
        title: data.title,
        description: data.description,
        questions: data.questions.map((q, qIndex) => ({
          text: q.text,
          type: 'single-select' as const,
          isMandatory: q.isMandatory,
          order: qIndex,
          options: q.options.map((opt, optIndex) => ({
            text: opt.text,
            order: optIndex,
          })),
        })),
        expiryDate: new Date(data.expiryDate).toISOString(),
        responseMode: data.responseMode,
      };

      await pollService.createPoll(pollData);
      toast.success('Poll created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Create poll error:', error);
      toast.error(error.response?.data?.error || 'Failed to create poll');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Poll</h1>
        <p className="mt-2 text-gray-600">Create your poll with multiple questions and options</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Poll Title */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Poll Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('title')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter poll title"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Poll Description */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Describe your poll"
          />
        </div>

        {/* Response Mode */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Response Mode
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="anonymous"
                {...register('responseMode')}
                className="h-4 w-4 text-indigo-600"
              />
              <span className="ml-2 text-sm text-gray-700">Anonymous (Anyone can respond)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="authenticated"
                {...register('responseMode')}
                className="h-4 w-4 text-indigo-600"
              />
              <span className="ml-2 text-sm text-gray-700">Authenticated (Login required)</span>
            </label>
          </div>
        </div>

        {/* Expiry Date */}
        <div className="bg-white rounded-lg shadow p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Date & Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            {...register('expiryDate')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.expiryDate && (
            <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
          )}
        </div>

        {/* Questions Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Question
            </button>
          </div>

          {errors.questions && (
            <p className="text-sm text-red-600">{errors.questions.message}</p>
          )}

          {questionFields.map((field, qIndex) => (
            <div key={field.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Question {qIndex + 1}
                </h3>
                <div className="flex space-x-2">
                  {qIndex > 0 && (
                    <button
                      type="button"
                      onClick={() => moveQuestion(qIndex, qIndex - 1)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ChevronUpIcon className="h-5 w-5" />
                    </button>
                  )}
                  {qIndex < questionFields.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveQuestion(qIndex, qIndex + 1)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ChevronDownIcon className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register(`questions.${qIndex}.text`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your question"
                />
                {errors.questions?.[qIndex]?.text && (
                  <p className="mt-1 text-sm text-red-600">{errors.questions[qIndex]?.text?.message}</p>
                )}
              </div>

              {/* Mandatory Toggle */}
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register(`questions.${qIndex}.isMandatory`)}
                    className="h-4 w-4 text-indigo-600 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Mandatory question</span>
                </label>
              </div>

              {/* Options Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Options <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => addOptionToQuestion(qIndex)}
                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Option
                  </button>
                </div>

                <div className="space-y-2">
                  {watch(`questions.${qIndex}.options`)?.map((_: any, optIndex: number) => (
                    <div key={optIndex} className="flex items-center space-x-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          {...register(`questions.${qIndex}.options.${optIndex}.text`)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder={`Option ${optIndex + 1}`}
                        />
                      </div>
                      {watch(`questions.${qIndex}.options`)?.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOptionFromQuestion(qIndex, optIndex)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {errors.questions?.[qIndex]?.options && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.questions[qIndex]?.options?.message}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Poll'}
          </button>
        </div>
      </form>
    </div>
  );
};