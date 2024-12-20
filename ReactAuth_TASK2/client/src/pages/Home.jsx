import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOut,
} from '../Redux/ User/UserSlice.js';

export default function Profile() {
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const [image, setImage] = useState(undefined);
  const [imagePercent, setImagePercent] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const { currentUser, loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    if (image) {
      handleFileUpload(image);
    }
  }, [image]);

  const handleFileUpload = async (image) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + image.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, image);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImagePercent(Math.round(progress));
      },
      (error) => {
        setImageError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, profilePicture: downloadURL })
        );
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error));
    }
  };

  const handleDeleteAccount = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error));
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout');
      dispatch(signOut());
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          type='file'
          ref={fileRef}
          hidden
          accept='image/*'
          onChange={(e) => setImage(e.target.files[0])}
        />
        <label htmlFor='file' className='cursor-pointer'>
          <img
            className='h-20 w-20 rounded-full object-cover mx-auto'
            src={formData.profilePicture || currentUser.profilePicture}
            alt=''
          />
          <div className='flex justify-center gap-2'>
            <button className='bg-green-500 text-white p-2 rounded-lg'>
              Upload Picture
            </button>
            {imagePercent > 0 && (
              <div className='text-xs text-gray-500'>{imagePercent}%</div>
            )}
          </div>
        </label>
        <input
          id='username'
          value={formData.username || currentUser.username}
          onChange={handleChange}
          type='text'
          placeholder='Enter Username'
          className='border px-2 py-1 rounded-md'
        />
        <input
          id='email'
          value={formData.email || currentUser.email}
          onChange={handleChange}
          type='email'
          placeholder='Enter Email'
          className='border px-2 py-1 rounded-md'
        />
        <button
          type='submit'
          disabled={loading}
          className='bg-blue-600 text-white rounded-lg py-2'
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
      {updateSuccess && (
        <div className='mt-4 text-green-500'>
          Profile updated successfully!
        </div>
      )}
      <button
        onClick={handleDeleteAccount}
        className='bg-red-600 text-white rounded-lg mt-4 py-2'
      >
        Delete Account
      </button>
      <button
        onClick={handleSignOut}
        className='bg-yellow-600 text-white rounded-lg mt-4 py-2'
      >
        Sign Out
      </button>
    </div>
  );
}
