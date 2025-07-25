import React, { useState } from 'react';
import ProfileForm from '../../components/ProfileForm';
import PdfPreview from '../../components/PdfPreview';
import { Shield } from 'lucide-react';

const MentorProfile = ({ user }) => {
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState(user);
  const isOwner = true;
  const handleProfileUpdated = (updatedUser) => {
    setProfile(updatedUser);
    setEditMode(false);
  };
  const API_BASE_URL = 'http://localhost:5000';
  const getPdfUrl = (cv) => cv?.startsWith('http') ? cv : `${API_BASE_URL}${cv}`;
  if (editMode) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 text-white">Edit Profil Mentor</h1>
        <ProfileForm user={profile} onProfileUpdated={handleProfileUpdated} />
        <button className="mt-4 text-gray-300 underline" onClick={() => setEditMode(false)}>Batal</button>
      </div>
    );
  }
  return (
    <div className="max-w-2xl mx-auto p-6 bg-[#181c2a] rounded shadow border border-[#23263a]">
      <div className="flex items-center gap-6 mb-6">
        <img src={profile.photo || 'https://via.placeholder.com/96x96/6B7280/FFFFFF?text=M'} alt="Foto Profil" className="w-24 h-24 rounded-full object-cover border border-[#23263a] bg-[#23263a]" />
        <div>
          <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-green-400" />
            <span className="text-gray-400 font-medium">Role: Mentor</span>
          </div>
        </div>
      </div>
      <div className="mb-4">
        <h2 className="font-semibold text-gray-300">Bio</h2>
        <p className="text-gray-400 whitespace-pre-line">{profile.bio || '-'}</p>
      </div>
      <div className="mb-4">
        <h2 className="font-semibold text-gray-300">CV</h2>
        {profile.cv ? (
          profile.cv.endsWith('.pdf') ? (
            <div>
              <PdfPreview fileUrl={getPdfUrl(profile.cv)} height={400} />
              <a
                href={getPdfUrl(profile.cv)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline block mt-2"
              >
                Download CV
              </a>
            </div>
          ) : (
            <a
              href={getPdfUrl(profile.cv)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              Download CV
            </a>
          )
        ) : (
          <span className="text-gray-500">Belum upload CV</span>
        )}
      </div>
      <div className="mb-4">
        <h2 className="font-semibold text-gray-300">Kontak</h2>
        <ul>
          {(profile.contacts || []).map((c, idx) => (
            <li key={idx} className="flex items-center gap-2 mb-1">
              <span className="inline-block w-5 text-center text-gray-400">
                <i className={`fa fa-${c.icon || 'user'}`}></i>
              </span>
              <span className="font-semibold text-gray-300">{c.type}:</span>
              <span className="text-gray-400">{c.value}</span>
            </li>
          ))}
        </ul>
      </div>
      {isOwner && (
        <button className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded" onClick={() => setEditMode(true)}>
          Edit Profil
        </button>
      )}
    </div>
  );
};

export default MentorProfile; 