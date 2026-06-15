import React, { useState } from 'react';
import { useTravel } from '../context/TravelContext';
import { SectionHeader } from '../components/SectionHeader';
import { Plus, Edit3, Trash2, X, MapPin, Camera, Loader } from 'lucide-react';
import type { Destination } from '../types';
import { authApi } from '../services/api';

export const ManageDestinations: React.FC = () => {
  const { destinations, addDestination, updateDestination, deleteDestination } = useTravel();

  // Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Field states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Destination['category']>('Beach');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [bestTimeToVisit, setBestTimeToVisit] = useState('');
  const [activitiesInput, setActivitiesInput] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    setErrorMsg('');
    try {
      const res = await authApi.uploadImage(file);
      setImage(res.data.url);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const categories: Destination['category'][] = ['Beach', 'Culture', 'Wildlife', 'Hill Country', 'Adventure', 'Heritage', 'Nature'];

  const handleOpenCreate = () => {
    setIsFormOpen(true);
    setEditingId(null);
    setName('');
    setCategory('Beach');
    setLocation('');
    setDescription('');
    setImage('');
    setBestTimeToVisit('');
    setActivitiesInput('');
    setErrorMsg('');
  };

  const handleOpenEdit = (dest: Destination) => {
    setIsFormOpen(true);
    setEditingId(dest.id);
    setName(dest.name);
    setCategory(dest.category);
    setLocation(dest.location);
    setDescription(dest.description);
    setImage(dest.image);
    setBestTimeToVisit(dest.bestTimeToVisit);
    setActivitiesInput(dest.activities.join(', '));
    setErrorMsg('');
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This will also delete any packages linked to it.`)) {
      // TODO: Connect to DELETE /api/destinations/:id in backend
      deleteDestination(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name || !location || !description || !bestTimeToVisit) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    const imgUrl = image || '/src/assets/destinations/sigiriya.png';
    const activitiesList = activitiesInput.split(',').map(s => s.trim()).filter(Boolean);

    const destData: Omit<Destination, 'id'> = {
      name,
      category,
      location,
      description,
      image: imgUrl,
      bestTimeToVisit,
      activities: activitiesList,
      highlights: [],
      budgetRange: 'LKR 25,000 - 50,000',
      rating: 4.8 // default rating
    };

    if (editingId) {
      // TODO: Connect to PUT /api/destinations/:id in backend
      updateDestination(editingId, destData);
    } else {
      // TODO: Connect to POST /api/destinations in backend
      addDestination(destData);
    }

    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <SectionHeader
          title="Manage Destinations"
          subtitle="Add, modify, or delete Sri Lankan destinations featured on the frontend catalog."
          badge="Destination Control"
        />
        {!isFormOpen && (
          <button
            onClick={handleOpenCreate}
            className="bg-primary-blue hover:bg-sky-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md flex items-center space-x-1 shrink-0 w-fit"
          >
            <Plus className="h-4 w-4" />
            <span>Add Destination</span>
          </button>
        )}
      </div>

      {/* Inline Form (Create/Edit) */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-black text-deep-navy">
              {editingId ? 'Edit Destination Details' : 'Create New Destination Listing'}
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {errorMsg && (
            <p className="text-xs text-error-red font-semibold">{errorMsg}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
            <div className="space-y-1.5">
              <label>Destination Name *</label>
              <input
                type="text"
                placeholder="Sigiriya Rock Fortress"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:border-primary-blue"
              />
            </div>

            <div className="space-y-1.5">
              <label>Travel Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold cursor-pointer focus:outline-none focus:border-primary-blue"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label>District / Province Location *</label>
              <input
                type="text"
                placeholder="Matale District, Central Province"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:border-primary-blue"
              />
            </div>

            <div className="space-y-1.5">
              <label>Best Season to Visit *</label>
              <input
                type="text"
                placeholder="January to April"
                value={bestTimeToVisit}
                onChange={(e) => setBestTimeToVisit(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:border-primary-blue"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label>Destination Image (URL or Upload)</label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:border-primary-blue"
                />
                <label
                  htmlFor="dest-image-upload"
                  className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-755 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5 shrink-0 border border-slate-200"
                >
                  {uploading ? (
                    <Loader className="w-4 h-4 animate-spin text-slate-500" />
                  ) : (
                    <Camera className="w-4 h-4 text-slate-505" />
                  )}
                  <span>{uploading ? 'Uploading...' : 'Choose File'}</span>
                </label>
                <input
                  id="dest-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label>Activities (Comma Separated)</label>
              <input
                type="text"
                placeholder="Rock Climbing, Photography, Exploring Ruins"
                value={activitiesInput}
                onChange={(e) => setActivitiesInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:border-primary-blue"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label>Detailed Description *</label>
              <textarea
                rows={3}
                placeholder="Provide history, background and traveler context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:border-primary-blue"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-500 rounded-xl font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary-blue hover:bg-sky-500 text-white rounded-xl font-bold shadow-md transition-colors"
            >
              {editingId ? 'Save Changes' : 'Create Listing'}
            </button>
          </div>
        </form>
      )}

      {/* Destinations Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map(dest => (
          <div key={dest.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
            <div className="relative aspect-[16/10]">
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 bg-primary-blue text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {dest.category}
              </span>
            </div>

            <div className="p-4 space-y-2 flex-grow">
              <h4 className="font-extrabold text-slate-800 text-sm leading-snug">{dest.name}</h4>
              <p className="text-[10px] text-text-gray font-semibold flex items-center">
                <MapPin className="h-3.5 w-3.5 text-primary-blue mr-0.5 shrink-0" />
                <span className="truncate">{dest.location}</span>
              </p>
            </div>

            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2">
              <button
                onClick={() => handleOpenEdit(dest)}
                className="p-1.5 text-slate-500 hover:text-primary-blue hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                title="Edit Details"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(dest.id, dest.name)}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                title="Delete Listing"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
