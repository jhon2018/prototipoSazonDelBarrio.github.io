
import React, { useState, useEffect } from 'react';
import { MENU_ITEMS, WHATSAPP_LINK, WHATSAPP_NUMBER, APP_NAME, APP_TAGLINE, LOCATION_SUBTITLE, YAPE_NAME, YAPE_PHONE, YAPE_QR_PATH, CONTACT_EMAIL } from './constants';
import { CartItem, MenuItem } from './types';
import FloatingWhatsApp from './components/FloatingWhatsApp';

declare const jspdf: any;

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationData, setLocationData] = useState<{lat: number, lng: number, url: string} | null>(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const [isQREnlarged, setIsQREnlarged] = useState(false);
  const [hasScrolledCategories, setHasScrolledCategories] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellidoPaterno: '',
    tipoEntrega: 'Retiro en local',
    direccion: '',
    telefono: '',
    fechaHora: new Date().toISOString().slice(0, 16),
    comentarios: ''
  });

  const [contactData, setContactData] = useState({
    nombre: '',
    email: '',
    mensaje: ''
  });

  const categories = ['Todos', 'Brosters', 'Chaufas', 'Platos Especiales', 'Salchipapas', 'Hamburguesas', 'Especiales'];
  const filteredItems = activeCategory === 'Todos' ? MENU_ITEMS : MENU_ITEMS.filter(item => item.category === activeCategory);
  const deliveryOptions = ["Retiro en local", "Delivery a mi casa", "Consumo en salón", "Enviar como regalo", "Pedido para evento", "Pedido anticipado"];
  
  const needsPrepayment = formData.tipoEntrega !== "Retiro en local" && formData.tipoEntrega !== "Consumo en salón";
  const needsAddress = formData.tipoEntrega === "Delivery a mi casa";

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    const savedCart = localStorage.getItem('sazon_cart_v5');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('sazon_cart_v5', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const cartTotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const handleGetLocation = () => {
    if (!navigator.geolocation) return alert("Geolocalización no compatible.");
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const url = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
        setLocationData({ lat: pos.coords.latitude, lng: pos.coords.longitude, url });
        setLoadingLocation(false);
      },
      () => { alert("No se pudo obtener GPS."); setLoadingLocation(false); }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPaymentScreenshot(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateReference = () => `PED-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 99).toString().padStart(2, '0')}`;

  const generatePDF = async () => {
    if (!formData.nombre || !formData.apellidoPaterno) {
      alert("Complete Nombre y Apellido Paterno.");
      return null;
    }
    if (needsPrepayment && !paymentScreenshot) {
      alert("Adjunte comprobante de pago por Yape.");
      return null;
    }

    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    const ref = generateReference();
    
    doc.setFontSize(24); doc.setTextColor(217, 83, 79); 
    doc.text(APP_NAME, 105, 20, { align: 'center' });
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`${APP_TAGLINE} | ${LOCATION_SUBTITLE}`, 105, 28, { align: 'center' });
    doc.line(20, 35, 190, 35);

    doc.setFontSize(14); doc.setTextColor(0);
    doc.text("COMPROBANTE DE PEDIDO", 20, 48);
    doc.setFontSize(9); doc.text(`CÓDIGO: ${ref} | FECHA: ${new Date().toLocaleString()}`, 20, 55);

    doc.setFontSize(11); doc.text("DATOS DEL CLIENTE", 20, 70);
    doc.setFontSize(9);
    doc.text(`NOMBRE: ${formData.nombre.toUpperCase()} ${formData.apellidoPaterno.toUpperCase()}`, 20, 77);
    doc.text(`MODALIDAD: ${formData.tipoEntrega.toUpperCase()}`, 20, 82);
    doc.text(`CELULAR: ${formData.telefono || 'N/A'}`, 20, 87);
    if (needsAddress) doc.text(`DIRECCIÓN: ${formData.direccion.toUpperCase()}`, 20, 92);

    doc.autoTable({
      startY: needsAddress ? 100 : 95,
      head: [['PRODUCTO', 'CANT', 'PRECIO UNIT.', 'SUBTOTAL']],
      body: cart.map(i => [i.name.toUpperCase(), i.quantity, `S/${i.price.toFixed(2)}`, `S/${(i.price*i.quantity).toFixed(2)}`]),
      theme: 'grid', headStyles: { fillColor: [217, 83, 79] }
    });

    const finalY = doc.lastAutoTable.finalY || 160;
    doc.setFontSize(16); doc.setTextColor(217, 83, 79);
    doc.text(`TOTAL A PAGAR: S/${cartTotal.toFixed(2)}`, 190, finalY + 15, { align: 'right' });

    if (paymentScreenshot) {
      doc.addPage();
      doc.text("COMPROBANTE DE PAGO (YAPE)", 105, 20, { align: 'center' });
      doc.addImage(paymentScreenshot, 'JPEG', 30, 30, 150, 190);
    }

    doc.save(`${ref}_${formData.nombre}.pdf`);
    return { ref };
  };

  const handleConfirmOrder = async () => {
    if (!formData.nombre || !formData.apellidoPaterno) return alert("Por favor, ingrese sus datos básicos.");
    if (needsPrepayment && !paymentScreenshot) return alert("Debe adjuntar su captura de Yape para este tipo de entrega.");
    
    const pdfResult = await generatePDF();
    if (!pdfResult) return;
    const { ref } = pdfResult;

    setTimeout(() => {
      let msg = `*NUEVO PEDIDO: ${APP_NAME}*\n`;
      msg += `_ID de Orden: ${ref}_\n\n`;
      msg += `👤 *CLIENTE:* ${formData.nombre.toUpperCase()} ${formData.apellidoPaterno.toUpperCase()}\n`;
      msg += `📦 *MODALIDAD:* ${formData.tipoEntrega.toUpperCase()}\n`;
      if (needsAddress) msg += `📍 *DIRECCIÓN:* ${formData.direccion}\n`;
      if (locationData) msg += `🗺️ *GPS:* ${locationData.url}\n`;
      msg += `\n*DETALLE:* \n` + cart.map(i => `• ${i.quantity}x ${i.name.toUpperCase()} (S/${(i.price * i.quantity).toFixed(2)})`).join('\n');
      msg += `\n\n💰 *TOTAL A PAGAR: S/${cartTotal.toFixed(2)}*\n\n`;
      msg += `⚠️ *ADJUNTO:* Ya descargué mi comprobante PDF. Lo enviaré a continuación para validar mi pedido.`;
      
      window.open(`https://wa.me/51${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    }, 1500);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Sazón del Barrio - Contacto Administrativo: ${contactData.nombre}`);
    const body = encodeURIComponent(
      `Estimado Equipo de Sazón del Barrio,\n\n` +
      `Has recibido un nuevo mensaje administrativo:\n\n` +
      `----------------------------------------\n` +
      `👤 NOMBRE DEL CLIENTE: ${contactData.nombre}\n` +
      `📧 CORREO DEL CLIENTE: ${contactData.email}\n` +
      `----------------------------------------\n\n` +
      `📝 MENSAJE:\n${contactData.mensaje}\n\n` +
      `----------------------------------------\n` +
      `Este mensaje fue enviado desde el portal oficial de Sazón del Barrio.`
    );
    window.location.href = `mailto:jhonvs93@hotmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-dark-main font-sans overflow-x-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-dark-main/95 backdrop-blur-md h-16 md:h-20 border-b dark:border-gray-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto h-full flex justify-between items-center px-4 md:px-8">
          <div className="flex flex-col cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="material-icons text-primary text-2xl md:text-3xl">restaurant</span>
              <h1 className="font-display font-black text-xl md:text-2xl tracking-tighter text-secondary uppercase leading-none">{APP_NAME}</h1>
            </div>
            <p className="text-[8px] md:text-[10px] uppercase tracking-widest font-black text-gray-400 ml-8 md:ml-9 leading-none">{APP_TAGLINE}</p>
          </div>
          
          <div className="hidden lg:flex items-center gap-10 text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">
            <a href="#" className="hover:text-primary transition-colors">Inicio</a>
            <a href="#menu" className="hover:text-primary transition-colors">Carta</a>
            <a href="#contacto" className="hover:text-primary transition-colors">Contacto</a>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors" aria-label="Cambiar tema">
              <span className="material-icons text-xl md:text-2xl">{isDarkMode?'light_mode':'dark_mode'}</span>
            </button>
            <button onClick={() => cartCount > 0 && setShowSummary(true)} className="relative p-2 text-primary hover:scale-105 transition-transform" aria-label="Ver carrito">
              <span className="material-icons text-2xl md:text-3xl">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-0 -right-0 bg-secondary text-white text-[9px] md:text-[10px] w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full border-2 border-white font-black animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="relative w-full h-[40vh] md:h-[50vh] lg:h-[320px] overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80" 
            className="w-full h-full object-cover" 
            alt="Sazón del Barrio Banner" 
          />
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"></div>
        </div>

        <div className="relative z-10 px-4 animate-in fade-in zoom-in-95 duration-700">
          <h2 className="text-4xl md:text-6xl lg:text-8xl font-display font-black text-white uppercase tracking-tighter leading-none drop-shadow-2xl">
            {APP_NAME}
          </h2>
          <p className="text-lg md:text-2xl lg:text-3xl font-black text-secondary uppercase italic tracking-widest drop-shadow-lg mt-2 md:mt-3">
            {LOCATION_SUBTITLE}
          </p>
        </div>
      </div>

      {/* Categories - Mejorado con Animación Peek Dinámica para Móviles */}
      <div className="py-6 md:py-8 bg-white dark:bg-dark-main sticky top-16 md:top-20 z-40 shadow-sm border-b dark:border-gray-800">
        <div 
          onScroll={() => setHasScrolledCategories(true)}
          className={`max-w-7xl mx-auto px-4 flex overflow-x-auto gap-3 md:gap-4 no-scrollbar justify-start md:justify-center transition-all duration-700 ${!hasScrolledCategories ? 'peek-animation' : ''}`}
        >
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => {
                setActiveCategory(cat);
                setHasScrolledCategories(true);
              }} 
              className={`px-6 md:px-8 py-2.5 md:py-3 rounded-full font-black text-[10px] md:text-[11px] uppercase transition-all whitespace-nowrap border-2 shadow-sm touch-manipulation ${activeCategory === cat ? 'bg-primary text-white border-primary scale-105 md:scale-110 shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700 hover:border-primary/50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Section */}
      <section id="menu" className="py-12 md:py-20 relative w-full bg-[#FAFAFA] dark:bg-gray-900 flex-1">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/food.png")` }}></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-8">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full border border-gray-100 dark:border-gray-700/50">
                <div className="relative h-48 sm:h-52 md:h-48 overflow-hidden">
                  <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt={item.name} loading="lazy" />
                  <div className="absolute top-4 right-4 bg-white/95 dark:bg-gray-900/95 px-3 py-1 rounded-2xl font-black text-primary text-sm shadow-xl border border-gray-100/50">S/{item.price.toFixed(2)}</div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-[14px] font-black dark:text-white uppercase truncate mb-2 tracking-tight">{item.name}</h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 leading-relaxed flex-1">{item.description}</p>
                  <button 
                    onClick={() => addToCart(item)} 
                    className="w-full bg-primary text-white py-3.5 rounded-2xl text-[11px] font-black uppercase hover:bg-red-600 transition-colors shadow-md active:scale-95 flex items-center justify-center gap-2 touch-manipulation"
                  >
                    <span className="material-icons text-lg">add_shopping_cart</span> Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Administrative Contact Section */}
      <section id="contacto" className="py-24 md:py-32 bg-white dark:bg-dark-main relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
            
            {/* Left side: Information */}
            <div className="flex-1 space-y-8 text-left">
              <div className="space-y-4">
                <span className="inline-block bg-primary/10 text-primary px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] animate-pulse">
                  Centro de Soporte
                </span>
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-display font-black text-secondary uppercase leading-[1] tracking-tighter">
                  Atención <br className="hidden md:block"/> <span className="text-primary italic">Directa</span>
                </h2>
                <div className="w-24 h-2 bg-primary rounded-full"></div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl leading-relaxed font-medium max-w-lg">
                Para consultas corporativas, sugerencias de mejora o reportes administrativos, por favor utilice el siguiente formulario. Nuestro equipo de gerencia le responderá formalmente.
              </p>
              
              <div className="space-y-6 pt-6">
                <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all">
                  <span className="material-icons text-primary text-4xl">alternate_email</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contacto Oficial</span>
                    <a href="mailto:jhonvs93@hotmail.com" className="font-bold text-xl md:text-2xl text-gray-900 dark:text-white hover:text-primary transition-colors">jhonvs93@hotmail.com</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Modern Form */}
            <div className="flex-[1.3] w-full bg-[#FFFBF7] dark:bg-gray-800/80 p-10 md:p-14 lg:p-16 rounded-[4rem] lg:rounded-[5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border-2 border-white dark:border-gray-700 relative z-10">
              <form className="space-y-10" onSubmit={handleContactSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] ml-2 block">Su Nombre Completo</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="Ej: Jonathan Vera" 
                      value={contactData.nombre} 
                      onChange={e=>setContactData({...contactData, nombre: e.target.value})} 
                      className="w-full bg-white dark:bg-gray-900 p-6 rounded-3xl border-none shadow-sm text-base focus:ring-4 focus:ring-primary/20 transition-all dark:text-white" 
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] ml-2 block">Correo de Respuesta</label>
                    <input 
                      required 
                      type="email" 
                      placeholder="email@ejemplo.com" 
                      value={contactData.email} 
                      onChange={e=>setContactData({...contactData, email: e.target.value})} 
                      className="w-full bg-white dark:bg-gray-900 p-6 rounded-3xl border-none shadow-sm text-base focus:ring-4 focus:ring-primary/20 transition-all dark:text-white" 
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.2em] ml-2 block">Contenido del Mensaje</label>
                  <textarea 
                    required 
                    placeholder="Describa detalladamente el motivo de su comunicación..." 
                    value={contactData.mensaje} 
                    onChange={e=>setContactData({...contactData, mensaje: e.target.value})} 
                    className="w-full bg-white dark:bg-gray-900 p-8 rounded-3xl border-none shadow-sm text-base h-56 resize-none focus:ring-4 focus:ring-primary/20 transition-all dark:text-white"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-secondary text-white font-black py-8 rounded-[2.5rem] uppercase text-sm md:text-base hover:bg-orange-600 transition-all shadow-2xl tracking-[0.4em] flex items-center justify-center gap-4 group active:scale-95"
                >
                   ENVIAR COMUNICACIÓN <span className="material-icons group-hover:translate-x-2 transition-transform">send</span>
                </button>
                
                <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
                  Al enviar, un representante de <span className="text-secondary">{APP_NAME}</span> recibirá una notificación en <span className="text-primary italic">jhonvs93@hotmail.com</span>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F0A09] text-white pt-24 pb-12 w-full overflow-hidden border-t-8 border-primary">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
            
            <div className="space-y-8 col-span-1 lg:col-span-1">
              <div className="flex items-center gap-3">
                <span className="material-icons text-primary text-4xl">restaurant</span>
                <h3 className="font-display font-black text-4xl tracking-tighter uppercase leading-none">{APP_NAME}</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed font-medium">
                Comprometidos con el auténtico sabor del barrio y la excelencia en el servicio. Desde Los Ángeles City para todo Lima Sur, llevando calidad y tradición a su mesa.
              </p>
              <div className="flex gap-4">
                {['instagram', 'facebook', 'tiktok'].map(social => (
                  <a key={social} href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/60 hover:bg-primary hover:text-white transition-all transform hover:-translate-y-2 border border-white/10" aria-label={`Seguir en ${social}`}>
                    <i className={`fab fa-${social} text-xl`}></i>
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-primary border-l-4 border-primary pl-4">Navegación</h4>
              <ul className="space-y-4 text-gray-400 font-bold text-sm uppercase tracking-widest">
                <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2"><span className="material-icons text-xs">arrow_forward</span> Inicio</a></li>
                <li><a href="#menu" className="hover:text-white transition-colors flex items-center gap-2"><span className="material-icons text-xs">arrow_forward</span> Nuestra Carta</a></li>
                <li><a href="#contacto" className="hover:text-white transition-colors flex items-center gap-2"><span className="material-icons text-xs">arrow_forward</span> Atención Administrativa</a></li>
              </ul>
            </div>

            <div className="space-y-8">
              <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-primary border-l-4 border-primary pl-4">Contacto Directo</h4>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <span className="material-icons text-primary text-2xl mt-1">phone_android</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-500 uppercase">Pedidos WhatsApp</span>
                    <span className="font-bold text-lg">{YAPE_PHONE}</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="material-icons text-primary text-2xl mt-1">support_agent</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-500 uppercase">Gestión Administrativa</span>
                    <span className="font-bold text-sm">jhonvs93@hotmail.com</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="space-y-8">
              <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-primary border-l-4 border-primary pl-4">Estamos en</h4>
              <div className="rounded-3xl overflow-hidden border border-white/10 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80" 
                  className="w-full h-32 object-cover" 
                  alt="Ubicación Los Angeles" 
                />
              </div>
              <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                <span className="material-icons text-sm">location_on</span> {LOCATION_SUBTITLE}, LIMA
              </p>
            </div>

          </div>

          <div className="pt-12 border-t border-white/10 flex flex-col lg:flex-row justify-between items-center gap-12">
            
            <div className="text-center lg:text-left space-y-2">
              <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.1em] flex items-center gap-2 justify-center lg:justify-start">
                © 2024 {APP_NAME} <span className="text-white/20">|</span> TODOS LOS DERECHOS RESERVADOS
              </p>
              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                SABOR DE LOS ÁNGELES CITY, LIMA
              </p>
            </div>

            <div className="flex items-center bg-white/[0.03] px-10 py-5 rounded-full border border-white/[0.08] shadow-inner transition-all hover:border-primary/50 group cursor-default">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mr-3">DESARROLLADO POR</span>
              <span className="text-primary font-black tracking-[0.3em] text-[13px] uppercase group-hover:scale-110 transition-transform">COLDSOLUTION IT</span>
            </div>

          </div>
        </div>
      </footer>

      <FloatingWhatsApp />

      {/* Checkout Modal */}
      {showSummary && (
        <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4 transition-opacity">
          <div className="bg-white dark:bg-gray-900 w-full max-w-5xl md:rounded-[3rem] lg:rounded-[4rem] shadow-2xl flex flex-col h-full md:h-auto max-h-[100vh] md:max-h-[95vh] overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
            <div className="bg-primary p-6 md:p-8 text-white flex justify-between items-center md:rounded-t-[3rem] lg:rounded-t-[4rem]">
              <div>
                <h3 className="font-black text-xl md:text-2xl uppercase tracking-tighter leading-none">DATOS PARA EL LOCAL</h3>
                <p className="text-[9px] md:text-[10px] font-black opacity-80 tracking-widest mt-1 uppercase">{APP_NAME} | ORDEN OFICIAL</p>
              </div>
              <button onClick={() => setShowSummary(false)} className="bg-white/20 p-2 md:p-3 rounded-full hover:bg-white/40 transition-colors">
                <span className="material-icons text-xl md:text-2xl">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12">
                <div className="space-y-6 md:space-y-8">
                  <div className="flex items-center justify-between border-b-2 border-primary/10 pb-4">
                    <h4 className="text-[12px] font-black text-primary uppercase tracking-widest">Tu Pedido</h4>
                    <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-[10px] font-black text-gray-500">{cartCount} Ítems</span>
                  </div>
                  <div className="space-y-4 max-h-[30vh] md:max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
                    {cart.map(i => (
                      <div key={i.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700/50">
                        <div className="flex-1 mr-4">
                          <p className="font-black text-[13px] uppercase dark:text-white leading-tight mb-0.5">{i.name}</p>
                          <p className="text-[11px] text-gray-500 font-bold tracking-tight">S/{i.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-white dark:bg-gray-700 px-2 py-1 rounded-2xl border">
                            <button onClick={()=>updateQuantity(i.id, -1)} className="font-black text-primary text-lg px-1">-</button>
                            <span className="text-sm font-black w-5 text-center">{i.quantity}</span>
                            <button onClick={()=>updateQuantity(i.id, 1)} className="font-black text-primary text-lg px-1">+</button>
                          </div>
                          <button onClick={()=>removeFromCart(i.id)} className="text-red-300 hover:text-red-500 transition-colors">
                            <span className="material-icons text-xl">delete_outline</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-end pt-8 border-t-4 border-double border-gray-100 dark:border-gray-800">
                    <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1">Total:</span>
                    <span className="text-4xl md:text-5xl font-black text-primary tracking-tighter">S/{cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-6 bg-orange-50/20 dark:bg-gray-800/50 p-6 md:p-8 lg:p-10 rounded-[3rem] border border-orange-100/30 dark:border-gray-700 shadow-inner">
                  <h4 className="text-[11px] font-black text-secondary uppercase border-b-2 border-secondary/20 pb-2 tracking-widest mb-6 text-center">Datos de Entrega</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase block ml-4">Nombre *</label>
                      <input required type="text" placeholder="Tu nombre" value={formData.nombre} onChange={e=>setFormData({...formData, nombre: e.target.value})} className="w-full bg-white dark:bg-gray-700 p-3.5 rounded-2xl text-sm border-none shadow-sm focus:ring-2 focus:ring-primary dark:text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase block ml-4">Apellido *</label>
                      <input required type="text" placeholder="Tu apellido" value={formData.apellidoPaterno} onChange={e=>setFormData({...formData, apellidoPaterno: e.target.value})} className="w-full bg-white dark:bg-gray-700 p-3.5 rounded-2xl text-sm border-none shadow-sm focus:ring-2 focus:ring-primary dark:text-white" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase block ml-4">Modalidad</label>
                    <select value={formData.tipoEntrega} onChange={e=>setFormData({...formData, tipoEntrega: e.target.value})} className="w-full bg-white dark:bg-gray-700 p-3.5 rounded-2xl text-sm border-none shadow-sm focus:ring-2 focus:ring-primary font-black dark:text-white">
                      {deliveryOptions.map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>

                  {needsAddress && (
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase block ml-4">Dirección Exacta</label>
                      <div className="flex gap-3">
                        <input type="text" placeholder="Calle, Jr., Mz, Lt." value={formData.direccion} onChange={e=>setFormData({...formData, direccion: e.target.value})} className="flex-1 bg-white dark:bg-gray-700 p-3.5 rounded-2xl text-sm border-none shadow-sm focus:ring-2 focus:ring-primary dark:text-white" />
                        <button onClick={handleGetLocation} className={`p-3 rounded-2xl transition-all shadow-md flex items-center justify-center ${locationData?'bg-green-500':'bg-secondary'} text-white`}>
                          <span className={`material-icons text-xl ${loadingLocation?'animate-spin':''}`}>{locationData?'check_circle':'my_location'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase block ml-4">Nro. de Celular</label>
                      <input type="tel" placeholder="9..." value={formData.telefono} onChange={e=>setFormData({...formData, telefono: e.target.value})} className="w-full bg-white dark:bg-gray-700 p-3.5 rounded-2xl text-sm border-none shadow-sm focus:ring-2 focus:ring-primary dark:text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase block ml-4">Hora de Entrega</label>
                      <input type="datetime-local" value={formData.fechaHora} onChange={e=>setFormData({...formData, fechaHora: e.target.value})} className="w-full bg-white dark:bg-gray-700 p-3.5 rounded-2xl text-[11px] border-none shadow-sm font-black dark:text-white" />
                    </div>
                  </div>

                  {needsPrepayment && (
                    <div className="p-5 md:p-6 bg-white dark:bg-gray-700 rounded-[2.5rem] border-2 border-primary/10 shadow-xl space-y-4 text-center">
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-primary uppercase leading-none mb-1">Yape Titular</p>
                          <p className="text-xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">{YAPE_PHONE}</p>
                          <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">{YAPE_NAME}</p>
                        </div>
                        <div onClick={()=>setIsQREnlarged(true)} className="w-20 h-20 rounded-[1.5rem] overflow-hidden cursor-zoom-in border-4 border-gray-50 dark:border-gray-600 shadow-xl">
                          <img src={YAPE_QR_PATH} alt="QR Yape" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-[10px] text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[9px] file:font-black file:bg-gray-100 file:text-primary file:uppercase" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 md:p-10 bg-gray-50 dark:bg-gray-800 flex flex-col sm:flex-row gap-4 md:gap-6 border-t-2 dark:border-gray-700">
              <button onClick={generatePDF} className="w-full sm:flex-1 bg-gray-900 text-white font-black py-5 rounded-[2.5rem] text-[11px] uppercase hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl">
                <span className="material-icons text-xl">picture_as_pdf</span> Descargar PDF
              </button>
              <button onClick={handleConfirmOrder} className="w-full sm:flex-[1.5] bg-[#25D366] text-white font-black py-5 rounded-[2.5rem] text-xs md:text-sm uppercase hover:bg-[#1da851] transition-all flex items-center justify-center gap-3 shadow-2xl transform active:scale-95">
                <i className="fab fa-whatsapp text-2xl"></i>
                Confirmar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged QR Modal */}
      {isQREnlarged && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-pointer" onClick={()=>setIsQREnlarged(false)}>
          <div className="relative max-w-sm w-full bg-white p-8 md:p-12 rounded-[4rem] animate-in zoom-in duration-300 shadow-2xl text-center" onClick={e=>e.stopPropagation()}>
            <h5 className="font-black text-secondary uppercase mb-8 tracking-[0.3em] text-sm">Escanea con Yape</h5>
            <div className="aspect-square bg-white rounded-[4rem] overflow-hidden shadow-2xl mb-10 border-8 border-gray-50 p-4">
               <img src={YAPE_QR_PATH} className="w-full h-full object-contain" alt="QR Yape" />
            </div>
            <div className="space-y-3 mb-12">
              <p className="font-black text-gray-400 uppercase text-[10px] tracking-widest leading-none mb-2">Beneficiario:</p>
              <p className="font-black text-gray-900 text-2xl uppercase leading-none">{YAPE_NAME}</p>
              <p className="font-black text-primary text-5xl tracking-tighter leading-none">{YAPE_PHONE}</p>
            </div>
            <button onClick={()=>setIsQREnlarged(false)} className="w-full py-5 bg-gray-100 rounded-[2.5rem] font-black uppercase text-[11px] hover:bg-gray-200 transition-colors tracking-widest">Cerrar</button>
          </div>
        </div>
      )}

      {/* Floating Action Cart */}
      {cartCount > 0 && !showSummary && (
        <div className="fixed bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-[55] w-[92%] md:w-[95%] max-w-sm md:max-w-md animate-in slide-in-from-bottom-20 duration-500">
          <button onClick={()=>setShowSummary(true)} className="w-full bg-primary text-white p-6 md:p-8 rounded-[3.5rem] md:rounded-[4rem] shadow-[0_25px_60px_rgba(217,83,79,0.5)] flex justify-between items-center animate-bounce-short border-4 border-white dark:border-gray-800 group overflow-hidden relative active:scale-95 transition-all touch-manipulation">
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center gap-4 md:gap-6 relative z-10">
              <span className="material-icons text-4xl md:text-5xl group-hover:rotate-12 transition-transform duration-300">shopping_bag</span>
              <div className="text-left leading-none">
                <p className="text-[10px] md:text-[11px] font-black uppercase tracking-tighter opacity-80 mb-1.5">Tu pedido actual</p>
                <p className="font-black text-lg md:text-xl">{cartCount} Platos listos</p>
              </div>
            </div>
            <div className="text-right font-black text-3xl md:text-4xl relative z-10 tracking-tighter">S/{cartTotal.toFixed(2)}</div>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
