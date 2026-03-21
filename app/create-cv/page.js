'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ModernCV({ cvData }) {
  const initials = cvData.name ? cvData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'CV'
  return (
    <div id="cv-preview" className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 px-10 py-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0 border-2 border-white border-opacity-40">
            {initials}
          </div>
          <div className="flex-1">
            <h2 className="text-white text-3xl font-bold">{cvData.name || 'Adınız Soyadınız'}</h2>
            {cvData.experience?.[0] && (
              <p className="text-blue-200 text-sm mt-1">{cvData.experience[0].position}</p>
            )}
          </div>
        </div>
        <div className="flex gap-5 mt-4 text-blue-100 text-xs flex-wrap">
          {cvData.email && <span>✉ {cvData.email}</span>}
          {cvData.phone && <span>📞 {cvData.phone}</span>}
          {cvData.location && <span>📍 {cvData.location}</span>}
        </div>
      </div>
      <div className="flex">
        <div className="w-2/3 p-8 border-r border-gray-100">
          {cvData.summary && (
            <div className="mb-6">
              <h3 className="text-blue-700 font-bold text-xs mb-2 uppercase tracking-widest pb-1 border-b border-blue-100">Hakkımda</h3>
              <p className="text-gray-600 text-sm leading-relaxed mt-2">{cvData.summary}</p>
            </div>
          )}
          {cvData.experience?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-blue-700 font-bold text-xs mb-3 uppercase tracking-widest pb-1 border-b border-blue-100">Deneyim</h3>
              {cvData.experience.map((exp, i) => (
                <div key={i} className="mb-4 pl-3 border-l-2 border-blue-400">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-900 font-semibold text-sm">{exp.position}</p>
                      <p className="text-blue-600 text-xs font-medium">{exp.company}</p>
                    </div>
                    <span className="text-xs text-white bg-blue-500 px-2 py-0.5 rounded-full shrink-0 ml-2">{exp.duration}</span>
                  </div>
                  {exp.description && <p className="text-gray-500 text-xs mt-1 leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          )}
          {cvData.education?.length > 0 && (
            <div>
              <h3 className="text-blue-700 font-bold text-xs mb-3 uppercase tracking-widest pb-1 border-b border-blue-100">Eğitim</h3>
              {cvData.education.map((edu, i) => (
                <div key={i} className="mb-3 pl-3 border-l-2 border-blue-400">
                  <p className="text-gray-900 font-semibold text-sm">{edu.school}</p>
                  <p className="text-gray-500 text-xs">{edu.degree}</p>
                  <p className="text-blue-500 text-xs">{edu.year}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="w-1/3 p-6 bg-blue-50">
          {cvData.skills?.length > 0 && (
            <div>
              <h3 className="text-blue-700 font-bold text-xs mb-3 uppercase tracking-widest pb-1 border-b border-blue-200">Beceriler</h3>
              <div className="flex flex-col gap-2 mt-2">
                {cvData.skills.map((skill, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0"></div>
                    <span className="text-gray-700 text-xs">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KlasikCV({ cvData }) {
  return (
    <div id="cv-preview" className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-gray-900 px-10 py-8">
        <h2 className="text-white text-3xl font-bold tracking-wide">{cvData.name}</h2>
        <div className="flex gap-4 mt-2 text-gray-300 text-sm flex-wrap">
          {cvData.email && <span>{cvData.email}</span>}
          {cvData.phone && <span>{cvData.phone}</span>}
          {cvData.location && <span>{cvData.location}</span>}
        </div>
        {cvData.summary && <p className="text-gray-300 mt-3 text-sm leading-relaxed">{cvData.summary}</p>}
      </div>
      <div className="p-10">
        {cvData.experience?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-gray-900 font-bold text-lg mb-4 uppercase tracking-widest border-b border-gray-300 pb-1">Deneyim</h3>
            {cvData.experience.map((exp, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-900 font-semibold">{exp.position}</p>
                    <p className="text-gray-600 text-sm italic">{exp.company}</p>
                  </div>
                  <p className="text-gray-500 text-sm">{exp.duration}</p>
                </div>
                {exp.description && <p className="text-gray-600 text-sm mt-1">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
        {cvData.education?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-gray-900 font-bold text-lg mb-4 uppercase tracking-widest border-b border-gray-300 pb-1">Eğitim</h3>
            {cvData.education.map((edu, i) => (
              <div key={i} className="mb-2">
                <p className="text-gray-900 font-semibold">{edu.school}</p>
                <p className="text-gray-500 text-sm">{edu.degree} — {edu.year}</p>
              </div>
            ))}
          </div>
        )}
        {cvData.skills?.length > 0 && (
          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-4 uppercase tracking-widest border-b border-gray-300 pb-1">Beceriler</h3>
            <div className="flex flex-wrap gap-2">
              {cvData.skills.map((skill, i) => (
                <span key={i} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 border border-gray-300">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MinimalCV({ cvData }) {
  return (
    <div id="cv-preview" className="bg-white rounded-2xl shadow-2xl p-10">
      <div className="mb-8">
        <h2 className="text-gray-900 text-4xl font-light">{cvData.name}</h2>
        <div className="flex gap-4 mt-2 text-gray-400 text-sm flex-wrap">
          {cvData.email && <span>{cvData.email}</span>}
          {cvData.phone && <span>{cvData.phone}</span>}
          {cvData.location && <span>{cvData.location}</span>}
        </div>
        {cvData.summary && <p className="text-gray-500 mt-3 text-sm leading-relaxed">{cvData.summary}</p>}
      </div>
      {cvData.experience?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-gray-300 font-medium text-xs mb-4 uppercase tracking-widest">Deneyim</h3>
          {cvData.experience.map((exp, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-900 font-medium">{exp.position}</p>
                  <p className="text-gray-400 text-sm">{exp.company}</p>
                </div>
                <p className="text-gray-300 text-sm">{exp.duration}</p>
              </div>
              {exp.description && <p className="text-gray-500 text-sm mt-1">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}
      {cvData.education?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-gray-300 font-medium text-xs mb-4 uppercase tracking-widest">Eğitim</h3>
          {cvData.education.map((edu, i) => (
            <div key={i} className="mb-2">
              <p className="text-gray-900 font-medium">{edu.school}</p>
              <p className="text-gray-400 text-sm">{edu.degree} — {edu.year}</p>
            </div>
          ))}
        </div>
      )}
      {cvData.skills?.length > 0 && (
        <div>
          <h3 className="text-gray-300 font-medium text-xs mb-4 uppercase tracking-widest">Beceriler</h3>
          <div className="flex flex-wrap gap-2">
            {cvData.skills.map((skill, i) => (
              <span key={i} className="text-gray-600 text-sm px-3 py-1 border border-gray-200 rounded-full">{skill}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function KreatifCV({ cvData }) {
  return (
    <div id="cv-preview" className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-10 py-8">
        <h2 className="text-white text-3xl font-bold">{cvData.name}</h2>
        <div className="flex gap-4 mt-2 text-purple-100 text-sm flex-wrap">
          {cvData.email && <span>{cvData.email}</span>}
          {cvData.phone && <span>{cvData.phone}</span>}
          {cvData.location && <span>{cvData.location}</span>}
        </div>
        {cvData.summary && <p className="text-purple-50 mt-3 text-sm leading-relaxed">{cvData.summary}</p>}
      </div>
      <div className="p-10">
        {cvData.experience?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-purple-600 font-bold text-lg mb-4 uppercase tracking-wide border-b-2 border-purple-300 pb-1">Deneyim</h3>
            {cvData.experience.map((exp, i) => (
              <div key={i} className="mb-4 pl-4 border-l-2 border-pink-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-900 font-semibold">{exp.position}</p>
                    <p className="text-purple-500 text-sm">{exp.company}</p>
                  </div>
                  <p className="text-gray-400 text-sm">{exp.duration}</p>
                </div>
                {exp.description && <p className="text-gray-600 text-sm mt-1">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
        {cvData.education?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-purple-600 font-bold text-lg mb-4 uppercase tracking-wide border-b-2 border-purple-300 pb-1">Eğitim</h3>
            {cvData.education.map((edu, i) => (
              <div key={i} className="mb-2 pl-4 border-l-2 border-pink-200">
                <p className="text-gray-900 font-semibold">{edu.school}</p>
                <p className="text-gray-500 text-sm">{edu.degree} — {edu.year}</p>
              </div>
            ))}
          </div>
        )}
        {cvData.skills?.length > 0 && (
          <div>
            <h3 className="text-purple-600 font-bold text-lg mb-4 uppercase tracking-wide border-b-2 border-purple-300 pb-1">Beceriler</h3>
            <div className="flex flex-wrap gap-2">
              {cvData.skills.map((skill, i) => (
                <span key={i} className="bg-purple-50 text-purple-700 text-sm px-3 py-1 rounded-full border border-purple-200">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TeknolojiCV({ cvData }) {
  return (
    <div id="cv-preview" className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
      <div className="border-b border-green-500 px-10 py-8">
        <h2 className="text-green-400 text-3xl font-bold font-mono">{cvData.name}</h2>
        <div className="flex gap-4 mt-2 text-green-600 text-sm flex-wrap font-mono">
          {cvData.email && <span>{cvData.email}</span>}
          {cvData.phone && <span>{cvData.phone}</span>}
          {cvData.location && <span>{cvData.location}</span>}
        </div>
        {cvData.summary && <p className="text-gray-400 mt-3 text-sm leading-relaxed">{cvData.summary}</p>}
      </div>
      <div className="p-10">
        {cvData.experience?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-green-500 font-bold text-lg mb-4 font-mono">// Deneyim</h3>
            {cvData.experience.map((exp, i) => (
              <div key={i} className="mb-4 pl-4 border-l border-green-800">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-semibold">{exp.position}</p>
                    <p className="text-green-500 text-sm font-mono">{exp.company}</p>
                  </div>
                  <p className="text-gray-500 text-sm font-mono">{exp.duration}</p>
                </div>
                {exp.description && <p className="text-gray-400 text-sm mt-1">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
        {cvData.education?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-green-500 font-bold text-lg mb-4 font-mono">// Eğitim</h3>
            {cvData.education.map((edu, i) => (
              <div key={i} className="mb-2 pl-4 border-l border-green-800">
                <p className="text-white font-semibold">{edu.school}</p>
                <p className="text-gray-400 text-sm">{edu.degree} — {edu.year}</p>
              </div>
            ))}
          </div>
        )}
        {cvData.skills?.length > 0 && (
          <div>
            <h3 className="text-green-500 font-bold text-lg mb-4 font-mono">// Beceriler</h3>
            <div className="flex flex-wrap gap-2">
              {cvData.skills.map((skill, i) => (
                <span key={i} className="bg-green-900 text-green-400 text-sm px-3 py-1 rounded border border-green-700 font-mono">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ElegantCV({ cvData }) {
  return (
    <div id="cv-preview" className="bg-amber-50 rounded-2xl shadow-2xl overflow-hidden">
      <div className="border-b-4 border-amber-600 px-10 py-8 text-center">
        <h2 className="text-amber-900 text-3xl font-bold tracking-widest uppercase">{cvData.name}</h2>
        <div className="flex gap-4 mt-2 text-amber-600 text-sm flex-wrap justify-center">
          {cvData.email && <span>{cvData.email}</span>}
          {cvData.phone && <span>{cvData.phone}</span>}
          {cvData.location && <span>{cvData.location}</span>}
        </div>
        {cvData.summary && <p className="text-amber-800 mt-3 text-sm leading-relaxed">{cvData.summary}</p>}
      </div>
      <div className="p-10">
        {cvData.experience?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-amber-700 font-bold text-lg mb-4 uppercase tracking-widest text-center border-b border-amber-300 pb-2">Deneyim</h3>
            {cvData.experience.map((exp, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-amber-900 font-semibold">{exp.position}</p>
                    <p className="text-amber-600 text-sm italic">{exp.company}</p>
                  </div>
                  <p className="text-amber-500 text-sm">{exp.duration}</p>
                </div>
                {exp.description && <p className="text-amber-800 text-sm mt-1">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
        {cvData.education?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-amber-700 font-bold text-lg mb-4 uppercase tracking-widest text-center border-b border-amber-300 pb-2">Eğitim</h3>
            {cvData.education.map((edu, i) => (
              <div key={i} className="mb-2">
                <p className="text-amber-900 font-semibold">{edu.school}</p>
                <p className="text-amber-600 text-sm">{edu.degree} — {edu.year}</p>
              </div>
            ))}
          </div>
        )}
        {cvData.skills?.length > 0 && (
          <div>
            <h3 className="text-amber-700 font-bold text-lg mb-4 uppercase tracking-widest text-center border-b border-amber-300 pb-2">Beceriler</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {cvData.skills.map((skill, i) => (
                <span key={i} className="bg-amber-100 text-amber-800 text-sm px-3 py-1 border border-amber-300">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function KompaktCV({ cvData }) {
  return (
    <div id="cv-preview" className="bg-white rounded-2xl shadow-2xl overflow-hidden flex">
      <div className="bg-slate-700 w-1/3 p-6">
        <div className="w-16 h-16 bg-slate-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto">
          {cvData.name?.charAt(0)}
        </div>
        <h2 className="text-white text-lg font-bold text-center mb-4">{cvData.name}</h2>
        <div className="text-slate-300 text-xs space-y-2 mb-6">
          {cvData.email && <p>✉ {cvData.email}</p>}
          {cvData.phone && <p>📞 {cvData.phone}</p>}
          {cvData.location && <p>📍 {cvData.location}</p>}
        </div>
        {cvData.skills?.length > 0 && (
          <div>
            <h3 className="text-slate-300 text-xs uppercase tracking-widest mb-2">Beceriler</h3>
            <div className="space-y-1">
              {cvData.skills.map((skill, i) => (
                <div key={i} className="bg-slate-600 text-slate-200 text-xs px-2 py-1 rounded">{skill}</div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 p-6">
        {cvData.summary && <p className="text-gray-600 text-sm mb-6 leading-relaxed">{cvData.summary}</p>}
        {cvData.experience?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-slate-700 font-bold text-sm mb-3 uppercase tracking-widest border-b border-slate-200 pb-1">Deneyim</h3>
            {cvData.experience.map((exp, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-900 font-semibold text-sm">{exp.position}</p>
                    <p className="text-slate-500 text-xs">{exp.company}</p>
                  </div>
                  <p className="text-gray-400 text-xs">{exp.duration}</p>
                </div>
                {exp.description && <p className="text-gray-500 text-xs mt-1">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
        {cvData.education?.length > 0 && (
          <div>
            <h3 className="text-slate-700 font-bold text-sm mb-3 uppercase tracking-widest border-b border-slate-200 pb-1">Eğitim</h3>
            {cvData.education.map((edu, i) => (
              <div key={i} className="mb-2">
                <p className="text-gray-900 font-semibold text-sm">{edu.school}</p>
                <p className="text-gray-400 text-xs">{edu.degree} — {edu.year}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AkademikCV({ cvData }) {
  return (
    <div id="cv-preview" className="bg-white rounded-2xl shadow-2xl p-10">
      <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
        <h2 className="text-gray-900 text-3xl font-bold uppercase tracking-widest">{cvData.name}</h2>
        <div className="flex gap-4 mt-2 text-gray-600 text-sm flex-wrap justify-center">
          {cvData.email && <span>{cvData.email}</span>}
          {cvData.phone && <span>{cvData.phone}</span>}
          {cvData.location && <span>{cvData.location}</span>}
        </div>
        {cvData.summary && <p className="text-gray-600 mt-3 text-sm leading-relaxed max-w-2xl mx-auto">{cvData.summary}</p>}
      </div>
      {cvData.experience?.length > 0 && (
        <div className="mb-6">
          <h3 className="text-gray-900 font-bold text-base mb-3 uppercase tracking-widest">Akademik Deneyim</h3>
          {cvData.experience.map((exp, i) => (
            <div key={i} className="mb-4 flex gap-4">
              <div className="text-gray-400 text-sm w-24 shrink-0 text-right">{exp.duration}</div>
              <div>
                <p className="text-gray-900 font-semibold">{exp.position}</p>
                <p className="text-gray-600 text-sm italic">{exp.company}</p>
                {exp.description && <p className="text-gray-500 text-sm mt-1">{exp.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
      {cvData.education?.length > 0 && (
        <div className="mb-6">
          <h3 className="text-gray-900 font-bold text-base mb-3 uppercase tracking-widest">Eğitim</h3>
          {cvData.education.map((edu, i) => (
            <div key={i} className="mb-3 flex gap-4">
              <div className="text-gray-400 text-sm w-24 shrink-0 text-right">{edu.year}</div>
              <div>
                <p className="text-gray-900 font-semibold">{edu.school}</p>
                <p className="text-gray-500 text-sm">{edu.degree}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {cvData.skills?.length > 0 && (
        <div>
          <h3 className="text-gray-900 font-bold text-base mb-3 uppercase tracking-widest">Beceriler</h3>
          <div className="flex flex-wrap gap-2">
            {cvData.skills.map((skill, i) => (
              <span key={i} className="text-gray-700 text-sm">{skill}{i < cvData.skills.length - 1 ? ' •' : ''}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
function TimelineCV({ cvData }) {
  const initials = cvData.name ? cvData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'CV'
  return (
    <div id="cv-preview" className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-gray-900 px-10 py-8 flex items-center gap-6">
        <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">
          {initials}
        </div>
        <div>
          <h2 className="text-white text-3xl font-bold">{cvData.name || 'Adınız Soyadınız'}</h2>
          {cvData.experience?.[0] && <p className="text-orange-400 text-sm mt-1">{cvData.experience[0].position}</p>}
          <div className="flex gap-4 mt-2 text-gray-400 text-xs flex-wrap">
            {cvData.email && <span>✉ {cvData.email}</span>}
            {cvData.phone && <span>📞 {cvData.phone}</span>}
            {cvData.location && <span>📍 {cvData.location}</span>}
          </div>
        </div>
      </div>
      <div className="p-10">
        {cvData.summary && (
          <div className="mb-8 bg-orange-50 border-l-4 border-orange-500 pl-4 py-3 rounded-r-xl">
            <p className="text-gray-700 text-sm leading-relaxed">{cvData.summary}</p>
          </div>
        )}
        {cvData.experience?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-gray-900 font-bold text-sm mb-4 uppercase tracking-widest">Deneyim</h3>
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-orange-200"></div>
              {cvData.experience.map((exp, i) => (
                <div key={i} className="mb-5 pl-10 relative">
                  <div className="absolute left-0 top-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-900 font-semibold text-sm">{exp.position}</p>
                      <p className="text-orange-600 text-xs font-medium">{exp.company}</p>
                    </div>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{exp.duration}</span>
                  </div>
                  {exp.description && <p className="text-gray-500 text-xs mt-1 leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-8">
          {cvData.education?.length > 0 && (
            <div>
              <h3 className="text-gray-900 font-bold text-sm mb-4 uppercase tracking-widest">Eğitim</h3>
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-orange-200"></div>
                {cvData.education.map((edu, i) => (
                  <div key={i} className="mb-3 pl-10 relative">
                    <div className="absolute left-0 top-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <p className="text-gray-900 font-semibold text-sm">{edu.school}</p>
                    <p className="text-gray-500 text-xs">{edu.degree} — {edu.year}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {cvData.skills?.length > 0 && (
            <div>
              <h3 className="text-gray-900 font-bold text-sm mb-4 uppercase tracking-widest">Beceriler</h3>
              <div className="flex flex-wrap gap-2">
                {cvData.skills.map((skill, i) => (
                  <span key={i} className="bg-orange-50 text-orange-700 text-xs px-3 py-1 rounded-full border border-orange-200">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SidebarCV({ cvData }) {
  const initials = cvData.name ? cvData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'CV'
  return (
    <div id="cv-preview" className="bg-white rounded-2xl shadow-2xl overflow-hidden flex">
      <div className="w-2/5 bg-slate-800 p-8 flex flex-col">
        <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
          {initials}
        </div>
        <h2 className="text-white text-xl font-bold text-center mb-1">{cvData.name || 'Adınız Soyadınız'}</h2>
        {cvData.experience?.[0] && <p className="text-teal-400 text-xs text-center mb-4">{cvData.experience[0].position}</p>}
        <div className="space-y-2 mb-6">
          {cvData.email && <p className="text-slate-300 text-xs flex items-center gap-2"><span className="text-teal-400">✉</span>{cvData.email}</p>}
          {cvData.phone && <p className="text-slate-300 text-xs flex items-center gap-2"><span className="text-teal-400">📞</span>{cvData.phone}</p>}
          {cvData.location && <p className="text-slate-300 text-xs flex items-center gap-2"><span className="text-teal-400">📍</span>{cvData.location}</p>}
        </div>
        {cvData.skills?.length > 0 && (
          <div>
            <h3 className="text-teal-400 font-bold text-xs uppercase tracking-widest mb-3 border-b border-slate-600 pb-2">Beceriler</h3>
            <div className="space-y-2">
              {cvData.skills.map((skill, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-300 text-xs">{skill}</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-1">
                    <div className="bg-teal-400 h-1 rounded-full" style={{width: `${85 - (i * 5)}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {cvData.education?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-teal-400 font-bold text-xs uppercase tracking-widest mb-3 border-b border-slate-600 pb-2">Eğitim</h3>
            {cvData.education.map((edu, i) => (
              <div key={i} className="mb-2">
                <p className="text-white text-xs font-medium">{edu.school}</p>
                <p className="text-slate-400 text-xs">{edu.degree}</p>
                <p className="text-teal-400 text-xs">{edu.year}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 p-8">
        {cvData.summary && (
          <div className="mb-6">
            <h3 className="text-slate-800 font-bold text-xs uppercase tracking-widest mb-2 border-b-2 border-teal-400 pb-1">Hakkımda</h3>
            <p className="text-gray-600 text-sm leading-relaxed mt-2">{cvData.summary}</p>
          </div>
        )}
        {cvData.experience?.length > 0 && (
          <div>
            <h3 className="text-slate-800 font-bold text-xs uppercase tracking-widest mb-3 border-b-2 border-teal-400 pb-1">Deneyim</h3>
            {cvData.experience.map((exp, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-900 font-semibold text-sm">{exp.position}</p>
                    <p className="text-teal-600 text-xs">{exp.company}</p>
                  </div>
                  <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded border border-teal-200">{exp.duration}</span>
                </div>
                {exp.description && <p className="text-gray-500 text-xs mt-1 leading-relaxed">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function BantCV({ cvData }) {
  const initials = cvData.name ? cvData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'CV'
  return (
    <div id="cv-preview" className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-rose-500 to-pink-400"></div>
      <div className="px-10 py-8 border-b border-gray-100">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 text-xl font-bold shrink-0 border-2 border-rose-200">
            {initials}
          </div>
          <div className="flex-1">
            <h2 className="text-gray-900 text-3xl font-bold">{cvData.name || 'Adınız Soyadınız'}</h2>
            {cvData.experience?.[0] && <p className="text-rose-500 text-sm mt-1 font-medium">{cvData.experience[0].position}</p>}
          </div>
        </div>
        <div className="flex gap-6 mt-4 text-gray-500 text-xs flex-wrap">
          {cvData.email && <span>✉ {cvData.email}</span>}
          {cvData.phone && <span>📞 {cvData.phone}</span>}
          {cvData.location && <span>📍 {cvData.location}</span>}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-0">
        <div className="col-span-2 p-8 border-r border-gray-100">
          {cvData.summary && (
            <div className="mb-6">
              <h3 className="text-rose-500 font-bold text-xs uppercase tracking-widest mb-2">Hakkımda</h3>
              <div className="h-0.5 bg-gradient-to-r from-rose-500 to-transparent mb-3"></div>
              <p className="text-gray-600 text-sm leading-relaxed">{cvData.summary}</p>
            </div>
          )}
          {cvData.experience?.length > 0 && (
            <div>
              <h3 className="text-rose-500 font-bold text-xs uppercase tracking-widest mb-2">Deneyim</h3>
              <div className="h-0.5 bg-gradient-to-r from-rose-500 to-transparent mb-3"></div>
              {cvData.experience.map((exp, i) => (
                <div key={i} className="mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-900 font-semibold text-sm">{exp.position}</p>
                      <p className="text-rose-500 text-xs">{exp.company}</p>
                    </div>
                    <span className="text-xs text-gray-400">{exp.duration}</span>
                  </div>
                  {exp.description && <p className="text-gray-500 text-xs mt-1 leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-6">
          {cvData.education?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-rose-500 font-bold text-xs uppercase tracking-widest mb-2">Eğitim</h3>
              <div className="h-0.5 bg-gradient-to-r from-rose-500 to-transparent mb-3"></div>
              {cvData.education.map((edu, i) => (
                <div key={i} className="mb-3">
                  <p className="text-gray-900 font-semibold text-xs">{edu.school}</p>
                  <p className="text-gray-500 text-xs">{edu.degree}</p>
                  <p className="text-rose-400 text-xs">{edu.year}</p>
                </div>
              ))}
            </div>
          )}
          {cvData.skills?.length > 0 && (
            <div>
              <h3 className="text-rose-500 font-bold text-xs uppercase tracking-widest mb-2">Beceriler</h3>
              <div className="h-0.5 bg-gradient-to-r from-rose-500 to-transparent mb-3"></div>
              <div className="flex flex-col gap-1.5">
                {cvData.skills.map((skill, i) => (
                  <span key={i} className="text-gray-600 text-xs flex items-center gap-1">
                    <span className="w-1 h-1 bg-rose-400 rounded-full shrink-0"></span>{skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KartliCV({ cvData }) {
  const initials = cvData.name ? cvData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'CV'
  return (
    <div id="cv-preview" className="bg-gray-100 rounded-2xl shadow-2xl p-6">
      <div className="bg-white rounded-xl p-6 mb-4 flex items-center gap-4 shadow-sm">
        <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1">
          <h2 className="text-gray-900 text-2xl font-bold">{cvData.name || 'Adınız Soyadınız'}</h2>
          {cvData.experience?.[0] && <p className="text-indigo-600 text-sm font-medium">{cvData.experience[0].position}</p>}
          <div className="flex gap-4 mt-1 text-gray-400 text-xs flex-wrap">
            {cvData.email && <span>{cvData.email}</span>}
            {cvData.phone && <span>{cvData.phone}</span>}
            {cvData.location && <span>{cvData.location}</span>}
          </div>
        </div>
      </div>
      {cvData.summary && (
        <div className="bg-indigo-50 rounded-xl p-4 mb-4 border border-indigo-100">
          <h3 className="text-indigo-700 font-bold text-xs uppercase tracking-widest mb-2">Hakkımda</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{cvData.summary}</p>
        </div>
      )}
      {cvData.experience?.length > 0 && (
        <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
          <h3 className="text-indigo-700 font-bold text-xs uppercase tracking-widest mb-3">Deneyim</h3>
          {cvData.experience.map((exp, i) => (
            <div key={i} className="mb-3 last:mb-0 pb-3 last:pb-0 border-b last:border-0 border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-900 font-semibold text-sm">{exp.position}</p>
                  <p className="text-indigo-500 text-xs">{exp.company}</p>
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg border border-indigo-100">{exp.duration}</span>
              </div>
              {exp.description && <p className="text-gray-500 text-xs mt-1 leading-relaxed">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {cvData.education?.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-indigo-700 font-bold text-xs uppercase tracking-widest mb-3">Eğitim</h3>
            {cvData.education.map((edu, i) => (
              <div key={i} className="mb-2">
                <p className="text-gray-900 font-semibold text-xs">{edu.school}</p>
                <p className="text-gray-500 text-xs">{edu.degree}</p>
                <p className="text-indigo-400 text-xs">{edu.year}</p>
              </div>
            ))}
          </div>
        )}
        {cvData.skills?.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="text-indigo-700 font-bold text-xs uppercase tracking-widest mb-3">Beceriler</h3>
            <div className="flex flex-wrap gap-1.5">
              {cvData.skills.map((skill, i) => (
                <span key={i} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-lg border border-indigo-100">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const CVComponents = {
  Modern: ModernCV,
  Klasik: KlasikCV,
  Minimal: MinimalCV,
  Kreatif: KreatifCV,
  Teknoloji: TeknolojiCV,
  Elegant: ElegantCV,
  Kompakt: KompaktCV,
  Akademik: AkademikCV,
   Timeline: TimelineCV,
  Sidebar: SidebarCV,
  Bant: BantCV,
  Kartlı: KartliCV,
}

function CreateCVContent() {
  const searchParams = useSearchParams()
  const initialTemplate = searchParams.get('template') || 'Modern'
  const [template, setTemplate] = useState(initialTemplate)
  const [mode, setMode] = useState(null)
  const [cvText, setCvText] = useState('')
  const [loading, setLoading] = useState(false)
  const [cvData, setCvData] = useState(null)
  const router = useRouter()

  const handleGenerate = async () => {
    if (!cvText) return
    setLoading(true)
    try {
      const response = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvContent: cvText, template, isRawText: mode === 'text' })
      })
      const data = await response.json()
      if (data.success) {
        setCvData(data.cvData)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from('cvs').insert({
            user_id: user.id,
            template: template,
            cv_data: data.cvData
          })
        }
      } else {
        alert('Hata: ' + data.error)
      }
    } catch (error) {
      alert('Bir hata oluştu')
    }
    setLoading(false)
  }

  const handleDownloadPDF = () => window.print()

  const CVComponent = CVComponents[template] || ModernCV

  if (cvData) {
    return (
      <div className="min-h-screen bg-gray-950 py-12">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-white text-2xl font-bold">CV Hazır! 🎉</h1>
            <div className="flex gap-3">
              <button onClick={() => setCvData(null)} className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-4 py-2 rounded-xl">Yeniden Oluştur</button>
              <button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-xl">📄 PDF İndir</button>
            </div>
          </div>
          <CVComponent cvData={cvData} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12">
      <div className="max-w-3xl mx-auto px-6">
        <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white text-sm mb-8 flex items-center gap-2">← Geri</button>
        <h1 className="text-white text-3xl font-bold mb-2">CV Oluştur</h1>
        <p className="text-gray-400 mb-8">Yapay zeka CV'ni saniyeler içinde hazırlasın</p>
        <div className="mb-8">
          <p className="text-gray-300 text-sm font-medium mb-3">Şablon: <span className="text-blue-400">{template}</span></p>
          <div className="flex flex-wrap gap-2">
            {Object.keys(CVComponents).map((t) => (
              <button key={t} onClick={() => setTemplate(t)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${template === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>{t}</button>
            ))}
          </div>
        </div>
        {!mode && (
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setMode('upload')} className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-2xl p-8 text-left transition-all">
              <div className="text-3xl mb-3">📄</div>
              <h3 className="text-white font-medium text-lg mb-1">CV Yükle</h3>
              <p className="text-gray-400 text-sm">Mevcut CV'ni yapıştır, yapay zeka dönüştürsün</p>
            </button>
            <button onClick={() => setMode('text')} className="bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-2xl p-8 text-left transition-all">
              <div className="text-3xl mb-3">✏️</div>
              <h3 className="text-white font-medium text-lg mb-1">Bilgileri Yaz</h3>
              <p className="text-gray-400 text-sm">CV bilgilerini yaz, yapay zeka tamamlasın</p>
            </button>
          </div>
        )}
       {mode && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-300 text-sm font-medium">
                  {mode === 'upload' ? 'CV dosyasını yükle' : 'Bilgilerini yaz'}
                </p>
                <button onClick={() => setMode(null)} className="text-gray-500 hover:text-white text-xs">Geri</button>
              </div>

              {mode === 'upload' && (
                <div className="mb-4">
                  <label className="w-full border-2 border-dashed border-gray-700 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-gray-900">
                    <div className="text-3xl mb-2">📁</div>
                    <p className="text-white text-sm font-medium mb-1">PDF veya Word dosyası seç</p>
                    <p className="text-gray-500 text-xs">.pdf, .doc, .docx desteklenir</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files[0]
                        if (!file) return
                        const formData = new FormData()
                        formData.append('file', file)
                        try {
                          const res = await fetch('/api/parse-cv', {
                            method: 'POST',
                            body: formData
                          })
                          const data = await res.json()
                          if (data.success) setCvText(data.text)
                          else alert('Dosya okunamadı: ' + data.error)
                        } catch (err) {
                          alert('Bir hata oluştu')
                        }
                      }}
                    />
                  </label>
                  {cvText && (
                    <div className="mt-3 bg-green-900 bg-opacity-30 border border-green-700 rounded-xl px-4 py-3">
                      <p className="text-green-400 text-sm">✅ Dosya okundu! CV oluşturmaya hazır.</p>
                    </div>
                  )}
                </div>
              )}

              {mode === 'text' && (
                <textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="Örnek: Adım Ahmet, yazılım geliştirici olarak 3 yıl çalıştım, Python ve React biliyorum, İstanbul Üniversitesi mezunuyum..."
                  className="w-full bg-gray-900 border border-gray-800 text-white rounded-xl px-4 py-3 h-72 outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm mb-3"
                />
              )}

              <button
                onClick={handleGenerate}
                disabled={loading || !cvText}
                className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all"
              >
                {loading ? '✨ CV Oluşturuluyor...' : '✨ CV Oluştur'}
              </button>
            </div>
          )}
      </div>
    </div>
  )
}

export default function CreateCV() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center"><p className="text-white">Yükleniyor...</p></div>}>
      <CreateCVContent />
    </Suspense>
  )
}