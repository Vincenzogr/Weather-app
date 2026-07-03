import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User as UserIcon, AlertCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AuthModal({ isOpen, onClose, onLogin }) {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [error, setError] = useState('');

  // Per effetto "antigravity" / parallax
  const modalRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isOpen) {
      // Reset dei campi alla chiusura
      setEmail('');
      setPassword('');
      setName('');
      setError('');
      setIsLogin(true);
    }
  }, [isOpen]);

  const handleMouseMove = (e) => {
    if (!modalRef.current) return;
    const { left, top, width, height } = modalRef.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    // Calcoliamo lo spostamento in percentuale (da -1 a 1)
    const x = (e.clientX - centerX) / (width / 2);
    const y = (e.clientY - centerY) / (height / 2);
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    // Torna alla posizione centrale in modo fluido
    setMousePos({ x: 0, y: 0 });
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && name.trim().length < 2) {
      setError(t('auth_error_name', 'Il nome deve avere almeno 2 caratteri.'));
      return;
    }
    
    if (!validateEmail(email)) {
      setError(t('auth_error_email', 'Inserisci un indirizzo email valido.'));
      return;
    }
    
    if (password.length < 8) {
      setError(t('auth_error_password', 'La password deve avere almeno 8 caratteri.'));
      return;
    }

    // Simulazione login/registrazione avvenuta con successo
    onLogin({ name: isLogin ? (email.split('@')[0] || 'Utente') : name, email });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="auth-modal-backdrop"
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.4 }}
          onClick={onClose}
        >
          <motion.div
            className="auth-modal-container"
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              // Effetto Antigravità (fluttuazione continua) + Parallax (reazione al mouse)
              rotateX: mousePos.y * -10, // Invertito per effetto tilt naturale
              rotateY: mousePos.x * 10,
              translateZ: 50,
            }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{ 
              type: 'spring', 
              stiffness: 250, 
              damping: 25,
              // Applico spring anche per il ritorno del mouse
              rotateX: { type: 'spring', stiffness: 100, damping: 30 },
              rotateY: { type: 'spring', stiffness: 100, damping: 30 }
            }}
          >
            <button className="auth-close-btn" onClick={onClose}>
              <X size={20} />
            </button>

            {/* Inner Floating Element for extra depth */}
            <motion.div 
              className="auth-modal-content"
              animate={{
                x: mousePos.x * -10,
                y: mousePos.y * -10,
              }}
              transition={{ type: 'spring', stiffness: 150, damping: 20 }}
            >
              <h2 className="auth-title">
                {isLogin ? t('auth_login_title', 'Bentornato') : t('auth_register_title', 'Unisciti a Noi')}
              </h2>
              <p className="auth-subtitle">
                {isLogin 
                  ? t('auth_login_sub', 'Accedi per sincronizzare i tuoi preferiti ovunque.') 
                  : t('auth_register_sub', 'Crea un account per sbloccare la tua dashboard.')}
              </p>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    className="auth-error-box"
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                  >
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="auth-form">
                <AnimatePresence>
                  {!isLogin && (
                    <motion.div 
                      className="auth-input-group"
                      initial={{ opacity: 0, height: 0, scaleY: 0.8 }}
                      animate={{ opacity: 1, height: 'auto', scaleY: 1 }}
                      exit={{ opacity: 0, height: 0, scaleY: 0.8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <UserIcon size={18} className="auth-input-icon" />
                      <input 
                        type="text" 
                        placeholder={t('auth_name_ph', 'Il tuo nome')} 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="auth-input"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="auth-input-group">
                  <Mail size={18} className="auth-input-icon" />
                  <input 
                    type="email" 
                    placeholder={t('auth_email_ph', 'Indirizzo Email')} 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input"
                  />
                </div>

                <div className="auth-input-group">
                  <Lock size={18} className="auth-input-icon" />
                  <input 
                    type="password" 
                    placeholder={t('auth_password_ph', 'Password')} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input"
                  />
                </div>

                <motion.button 
                  type="submit" 
                  className="auth-submit-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLogin ? t('auth_login_btn', 'Accedi ora') : t('auth_register_btn', 'Crea Account')}
                  <ArrowRight size={18} />
                </motion.button>
              </form>

              <div className="auth-switch-text">
                {isLogin ? t('auth_no_account', 'Non hai un account?') : t('auth_has_account', 'Hai già un account?')}
                <button 
                  type="button" 
                  className="auth-switch-btn"
                  onClick={() => { setIsLogin(!isLogin); setError(''); }}
                >
                  {isLogin ? t('auth_switch_register', 'Registrati') : t('auth_switch_login', 'Accedi')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
