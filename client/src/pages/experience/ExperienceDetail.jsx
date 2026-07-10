import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import Loader from '../../components/common/Loader';

const ExperienceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: exp, isLoading, error } = useFetch(`/api/experiences/${id}`);

  if (isLoading) return <Loader />;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!exp) return <div className="p-8 text-center">Experience not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-slate-500 hover:text-indigo-600 transition mb-6"
      >
        &larr; Back to Feed
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xl font-bold">
            {exp.authorName?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{exp.title}</h1>
            <p className="text-slate-500">
              {exp.authorName} • Placed at <span className="font-semibold text-slate-700">{exp.companyName}</span> as {exp.role}
            </p>
          </div>
        </div>

        <div className="prose max-w-none text-slate-700">
          {/* If your content is saved as plain text with line breaks */}
          <div className="whitespace-pre-wrap">{exp.content}</div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-100 flex gap-2">
          {exp.tags?.map((tag, index) => (
            <span key={index} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetail;