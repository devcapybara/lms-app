import React, { useState } from 'react';
import { userAPI } from '../utils/userAPI';

const defaultContacts = [
  { type: 'linkedin', value: '', icon: 'linkedin' },
  { type: 'email', value: '', icon: 'envelope' },
  { type: 'phone', value: '', icon: 'phone' },
];

const iconOptions = [
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'Email', value: 'envelope' },
  { label: 'Phone', value: 'phone' },
  { label: 'Github', value: 'github' },
  { label: 'Website', value: 'globe' },
  { label: 'Custom', value: 'user' },
];

const ProfileForm = ({ user, onProfileUpdated }) => {
  const [bio, setBio] = useState(user.bio || '');
  const [contacts, setContacts] = useState(user.contacts?.length ? user.contacts : defaultContacts);
  const [cvFile, setCvFile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContactChange = (idx, field, value) => {
    setContacts(contacts.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const addContact = () => {
    setContacts([...contacts, { type: '', value: '', icon: 'user' }]);
  };

  const removeContact = (idx) => {
    setContacts(contacts.filter((_, i) => i !== idx));
  };

  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== 'application/pdf') {
      setError('CV/Portofolio hanya boleh file PDF!');
      setCvFile(null);
      e.target.value = '';
      return;
    }
    setError('');
    setCvFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let cvPath = user.cv;
      let photoPath = user.photo;
      if (cvFile) {
        const res = await userAPI.uploadCV(cvFile);
        cvPath = res.cvPath;
      }
      if (photoFile) {
        const res = await userAPI.uploadPhoto(photoFile);
        photoPath = res.photoPath;
      }
      const profileData = {
        bio,
        contacts: contacts.filter(c => c.value),
        cv: cvPath,
        photo: photoPath,
      };
      const res = await userAPI.updateProfile(profileData);
      if (onProfileUpdated) onProfileUpdated(res.user);
    } catch (err) {
      setError('Gagal update profil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="block font-semibold mb-1 text-white">Bio Singkat</label>
        <textarea
          className="w-full border rounded p-2 bg-[#181c2a] text-white border-[#23263a] placeholder-gray-400"
          rows={3}
          value={bio}
          onChange={e => setBio(e.target.value)}
          maxLength={500}
          placeholder="Tulis bio singkat tentang dirimu..."
        />
      </div>
      <div>
        <label className="block font-semibold mb-1 text-white">Upload CV (PDF/DOC/DOCX)</label>
        <input type="file" accept=".pdf" onChange={handleCvChange} className="bg-[#181c2a] text-white border border-[#23263a] rounded" />
        {user.cv && (
          <div className="mt-1 text-sm">
            CV saat ini: <a href={user.cv} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Download CV</a>
            <button 
              type="button" 
              onClick={async () => {
                if (window.confirm('Yakin ingin menghapus CV?')) {
                  try {
                    await userAPI.deleteCV();
                    if (onProfileUpdated) {
                      const updatedUser = { ...user, cv: null };
                      onProfileUpdated(updatedUser);
                    }
                  } catch (err) {
                    setError('Gagal menghapus CV.');
                  }
                }
              }}
              className="ml-2 text-red-400 underline"
            >
              Hapus CV
            </button>
          </div>
        )}
      </div>
      <div>
        <label className="block font-semibold mb-1 text-white">Foto Profil</label>
        <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} className="bg-[#181c2a] text-white border border-[#23263a] rounded" />
        {user.photo && (
          <div className="mt-1">
            <img src={user.photo} alt="Foto Profil" className="w-20 h-20 rounded-full object-cover border border-[#23263a] bg-[#23263a]" />
            <button 
              type="button" 
              onClick={async () => {
                if (window.confirm('Yakin ingin menghapus foto profil?')) {
                  try {
                    await userAPI.deletePhoto();
                    if (onProfileUpdated) {
                      const updatedUser = { ...user, photo: null };
                      onProfileUpdated(updatedUser);
                    }
                  } catch (err) {
                    setError('Gagal menghapus foto profil.');
                  }
                }
              }}
              className="ml-2 text-red-400 underline text-sm"
            >
              Hapus Foto
            </button>
          </div>
        )}
      </div>
      <div>
        <label className="block font-semibold mb-1 text-white">Kontak</label>
        {contacts.map((c, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <select
              className="border rounded p-1 bg-[#181c2a] text-white border-[#23263a]"
              value={c.icon}
              onChange={e => handleContactChange(idx, 'icon', e.target.value)}
            >
              {iconOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input
              className="border rounded p-1 flex-1 bg-[#181c2a] text-white border-[#23263a] placeholder-gray-400"
              placeholder="Tipe (LinkedIn, Email, dsb)"
              value={c.type}
              onChange={e => handleContactChange(idx, 'type', e.target.value)}
            />
            <input
              className="border rounded p-1 flex-1 bg-[#181c2a] text-white border-[#23263a] placeholder-gray-400"
              placeholder="Isi kontak (URL/email/no HP)"
              value={c.value}
              onChange={e => handleContactChange(idx, 'value', e.target.value)}
            />
            <button type="button" className="text-red-500" onClick={() => removeContact(idx)}>-</button>
          </div>
        ))}
        <button type="button" className="text-blue-400 underline" onClick={addContact}>+ Tambah Kontak</button>
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <button type="submit" className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded" disabled={loading}>
        {loading ? 'Menyimpan...' : 'Simpan Profil'}
      </button>
    </form>
  );
};

export default ProfileForm; 