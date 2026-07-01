import React from 'react';
import { motion } from 'framer-motion';
import { History, MapPin } from 'lucide-react';

export default function RecentCities({ cities, onSelect }) {
  if (!cities || cities.length === 0) return null;

  return (
    <motion.div
      className="recent-cities"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <span className="recent-label">
        <History size={13} />
        Recenti
      </span>
      {cities.map((city, i) => (
        <motion.button
          key={city}
          className="recent-chip"
          onClick={() => onSelect(city)}
          aria-label={`Cerca di nuovo ${city}`}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: i * 0.05 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MapPin size={11} />
          {city}
        </motion.button>
      ))}
    </motion.div>
  );
}
