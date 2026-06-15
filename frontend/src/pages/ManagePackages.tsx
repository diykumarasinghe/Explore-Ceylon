import React, { useState } from 'react';
import { useTravel } from '../context/TravelContext';
import { SectionHeader } from '../components/SectionHeader';
import { Plus, Edit3, Trash2, X, Camera, Loader } from 'lucide-react';
import type { Package } from '../types';
import { authApi } from '../services/api';

export const ManagePackages: React.FC = () => {
  const { packages, destinations, addPackage, updatePackage, deletePackage } = useTravel();

  // State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [destinationId, setDestinationId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [price, setPrice] = useState(199);
  const [durationDays, setDurationDays] = useState(3);
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [maxGroupSize, setMaxGroupSize] = useState(10);
  const [includedInput, setIncludedInput] = useState('');
  
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

  const handleDurationDaysChange = (val: number) => {
    const newDays = Math.max(1, val);
    setDurationDays(newDays);
    setItinerary((prev) => {
      const adjusted = [...prev];
      if (adjusted.length < newDays) {
        for (let i = adjusted.length; i < newDays; i++) {
          adjusted.push({
            day: i + 1,
            title: `Day ${i + 1} Activity`,
            description: `Description of activities and schedule for Day ${i + 1}.`,
          });
        }
      } else if (adjusted.length > newDays) {
        adjusted.splice(newDays);
      }
      return adjusted.map((item, idx) => ({
        ...item,
        day: idx + 1,
      }));
    });
  };

  const handleItineraryChange = (index: number, field: 'title' | 'description', value: string) => {
    setItinerary((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  const handleOpenCreate = () => {
    setIsFormOpen(true);
    setEditingId(null);
    setDestinationId(destinations[0]?.id || '');
    setName('');
    setDescription('');
    setImage('');
    setPrice(199);
    setDurationDays(3);
    setItinerary([
      { day: 1, title: 'Arrival & Welcome', description: 'Meet with coordinator, transfer to hotel, and briefing.' },
      { day: 2, title: 'City Excursion & Hikes', description: 'Enjoy guided walking tours, outdoor photography, and dining.' },
      { day: 3, title: 'Departure Transit', description: 'Check out and transfer to airport.' }
    ]);
    setMaxGroupSize(10);
    setIncludedInput('');
    setErrorMsg('');
  };

  const handleOpenEdit = (pkg: Package) => {
    setIsFormOpen(true);
    setEditingId(pkg.id);
    setDestinationId(pkg.destinationId);
    setName(pkg.name);
    setDescription(pkg.description);
    setImage(pkg.image);
    setPrice(pkg.price);
    setDurationDays(pkg.durationDays);
    setItinerary(pkg.itinerary || []);
    setMaxGroupSize(pkg.maxGroupSize);
    setIncludedInput(pkg.includedServices.join(', '));
    setErrorMsg('');
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deletePackage(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!destinationId || !name || !description || !price || !durationDays) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    const selectedDest = destinations.find(d => d.id === destinationId);
    if (!selectedDest) {
      setErrorMsg('Selected destination is invalid.');
      return;
    }

    const imgUrl = image || '/src/assets/destinations/sigiriya.png';
    const inclusionsList = includedInput.split(',').map(s => s.trim()).filter(Boolean);

    const packageData = {
      destinationId,
      name,
      description,
      image: imgUrl,
      price: Number(price),
      durationDays: Number(durationDays),
      maxGroupSize: Number(maxGroupSize),
      includedServices: inclusionsList,
      category: selectedDest.category,
      rating: 4.7,
      itinerary: itinerary,
    };

    if (editingId) {
      updatePackage(editingId, packageData);
    } else {
      addPackage(packageData);
    }

    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <SectionHeader
          title="Manage Tour Packages"
          subtitle="Add, modify, or retire Sri Lankan packages and itineraries."
          badge="Package Administration"
        />
        {!isFormOpen && (
          <button
            onClick={handleOpenCreate}
            className="bg-primary-blue hover:bg-sky-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md flex items-center space-x-1 shrink-0 w-fit"
          >
            <Plus className="h-4 w-4" />
            <span>Add Package</span>
          </button>
        )}
      </div>

      {/* Form (Create/Edit) */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs space-y-4 font-semibold text-slate-600">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-black text-deep-navy">
              {editingId ? 'Edit Package Fields' : 'Create New Travel Package'}
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
            <p className="text-xs text-error-red font-bold">{errorMsg}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label>Link Destination *</label>
              <select
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold cursor-pointer focus:outline-none focus:border-primary-blue"
              >
                <option value="" disabled>Select Location</option>
                {destinations.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.category})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label>Package Title *</label>
              <input
                type="text"
                placeholder="Scenic Ella Adventure Package"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:border-primary-blue"
              />
            </div>

            <div className="space-y-1.5">
              <label>Price Per Person ($) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:border-primary-blue"
              />
            </div>

            <div className="space-y-1.5">
              <label>Duration (Days) *</label>
              <input
                type="number"
                min={1}
                value={durationDays}
                onChange={(e) => handleDurationDaysChange(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:border-primary-blue"
              />
            </div>

            <div className="space-y-1.5">
              <label>Max Group Size *</label>
              <input
                type="number"
                value={maxGroupSize}
                onChange={(e) => setMaxGroupSize(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:border-primary-blue"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-3">
              <label>Package Image (URL or Upload)</label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:border-primary-blue"
                />
                <label
                  htmlFor="pkg-image-upload"
                  className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-755 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5 shrink-0 border border-slate-200"
                >
                  {uploading ? (
                    <Loader className="w-4 h-4 animate-spin text-slate-500" />
                  ) : (
                    <Camera className="w-4 h-4 text-slate-550" />
                  )}
                  <span>{uploading ? 'Uploading...' : 'Choose File'}</span>
                </label>
                <input
                  id="pkg-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-3">
              <label>Included Services (Comma Separated)</label>
              <input
                type="text"
                placeholder="3-Star Hotel Stay, Entry Tickets, Driver Transit"
                value={includedInput}
                onChange={(e) => setIncludedInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:border-primary-blue"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-3">
              <label>Brief Description *</label>
              <textarea
                rows={3}
                placeholder="Provide details about stays, routes, hiking difficulty..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:border-primary-blue"
              />
            </div>

            <div className="space-y-3 sm:col-span-3 border-t border-slate-100 pt-4">
              <h4 className="text-xs font-black text-deep-navy uppercase tracking-wider">Detailed Itinerary</h4>
              <p className="text-[11px] text-slate-400 font-semibold mb-2">Adjust the itinerary details for each day. Mismatched days will fail backend validation.</p>
              
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {itinerary.map((item, index) => (
                  <div key={index} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-primary-blue bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">Day {item.day}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-1 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">Activity Title *</label>
                        <input
                          type="text"
                          required
                          value={item.title || ''}
                          onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
                          placeholder={`Day ${item.day} Title`}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-primary-blue"
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">Activity Description *</label>
                        <input
                          type="text"
                          required
                          value={item.description || ''}
                          onChange={(e) => handleItineraryChange(index, 'description', e.target.value)}
                          placeholder={`Activities for Day ${item.day}...`}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-primary-blue"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
              {editingId ? 'Save Changes' : 'Create Package'}
            </button>
          </div>
        </form>
      )}

      {/* Packages Admin Table list */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-700">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
                <th className="p-4">Package Name</th>
                <th className="p-4">Price</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Max Group</th>
                <th className="p-4">Travel Category</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.map(pkg => (
                <tr key={pkg.id} className="border-b border-slate-50 last:border-b-0">
                  <td className="p-4 flex items-center space-x-3">
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                    <span className="font-extrabold text-slate-800 leading-snug">{pkg.name}</span>
                  </td>
                  <td className="p-4 font-black text-primary-blue">${pkg.price}</td>
                  <td className="p-4 text-slate-500">{pkg.durationDays} Days</td>
                  <td className="p-4 text-slate-500">{pkg.maxGroupSize} People</td>
                  <td className="p-4">
                    <span className="bg-sky-50 text-primary-blue font-bold px-2 py-0.5 rounded-full border border-sky-100">
                      {pkg.category}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(pkg)}
                      className="p-1.5 text-slate-500 hover:text-primary-blue hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
                      title="Edit Package"
                    >
                      <Edit3 className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id, pkg.name)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
                      title="Delete Package"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
