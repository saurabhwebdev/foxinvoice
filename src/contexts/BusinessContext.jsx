import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';

const BusinessContext = createContext();

const taxRegimes = {
  'INR': [
    { value: 'regular', label: 'Regular', default: true },
    { value: 'composition', label: 'Composition' }
  ],
  'USD': [
    { value: 'regular', label: 'Regular', default: true }
  ],
  'EUR': [
    { value: 'regular', label: 'Regular', default: true }
  ]
};

export function useBusinessProfile() {
  return useContext(BusinessContext);
}

export function BusinessProvider({ children }) {
  const [businessProfile, setBusinessProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const getInitials = (businessName) => {
    if (!businessName) return '';
    return businessName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    const fetchBusinessProfile = async () => {
      if (!currentUser) {
        setBusinessProfile(null);
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, 'businessProfiles', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBusinessProfile({
            ...data,
            initials: getInitials(data.businessName),
            taxRegime: data.taxRegime || (
              taxRegimes[data.defaultCurrency]?.find(regime => regime.default)?.value
            )
          });
        } else {
          setBusinessProfile(null);
        }
      } catch (error) {
        console.error('Error fetching business profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessProfile();
  }, [currentUser]);

  const value = {
    businessProfile,
    setBusinessProfile,
    loading
  };

  return (
    <BusinessContext.Provider value={value}>
      {!loading && children}
    </BusinessContext.Provider>
  );
}

export default BusinessProvider; 