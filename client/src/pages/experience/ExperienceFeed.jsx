import React from 'react';
import { useFetch } from '../../hooks/useFetch';
import Loader from '../../components/common/Loader';
import { Link } from 'react-router-dom';

const ExperienceFeed = () => {
  // Assuming your API endpoint is /api/experiences
  const { data: experiences, isLoading, error } = useFetch('/api/experiences');

  if (isLoading) return <Loader />;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Interview Experiences</h1>
          <p className="text-slate-500 mt-1">Learn from seniors who cracked top companies.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          Share Experience
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {experiences?.map((exp) => (
          <div key={exp._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                {exp.authorName?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{exp.companyName}</h3>
                <p className="text-xs text-slate-500">{exp.role}</p>
              </div>
            </div>
            <h4 className="text-lg font-medium text-slate-800 mb-2">{exp.title}</h4>
            <p className="text-sm text-slate-600 line-clamp-3 mb-4">{exp.content}</p>
            <Link 
              to={`/experiences/${exp._id}`}
              className="text-indigo-600 text-sm font-medium hover:underline"
            >
              Read full experience &rarr;
            </Link>
          </div>
        ))}

        {!experiences?.length && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No experiences shared yet. Be the first!
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperienceFeed;