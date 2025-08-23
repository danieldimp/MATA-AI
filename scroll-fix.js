// FIX PARA PREVENIR SCROLL AUTOMÁTICO
// Incluir este script ANTES del script.js principal

(function() {
    'use strict';
    
    console.log('🔧 Aplicando fix para prevenir scroll automático...');
    
    // 1. FORZAR SCROLL AL TOP INMEDIATAMENTE
    const forceScrollTop = () => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        if (document.body) {
            document.body.scrollTop = 0;
        }
    };
    
    // 2. APLICAR INMEDIATAMENTE
    forceScrollTop();
    
    // 3. DESHABILITAR RESTAURACIÓN DE SCROLL
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    
    // 4. MANEJAR HASH EN URL SOLO PARA NAVEGACIÓN LEGÍTIMA
    if (window.location.hash && window.location.hash !== '#') {
        // Verificar si viene de navegación externa legítima
        const fromExternal = document.referrer && !document.referrer.includes(window.location.hostname);
        const fromOtherPage = document.referrer && 
                              document.referrer.includes(window.location.hostname) && 
                              !document.referrer.includes(window.location.pathname);
        
        if (!fromExternal && !fromOtherPage) {
            // Si no viene de navegación externa, remover el hash
            console.log('🚫 Removiendo hash no deseado:', window.location.hash);
            history.replaceState('', document.title, window.location.pathname + window.location.search);
            forceScrollTop();
        } else {
            console.log('✅ Hash permitido por navegación externa');
        }
    }
    
    // 5. REFORZAR EN EVENTOS CLAVE
    document.addEventListener('DOMContentLoaded', () => {
        forceScrollTop();
        setTimeout(forceScrollTop, 50);
        setTimeout(forceScrollTop, 100);
        setTimeout(forceScrollTop, 200);
        console.log('✅ DOMContentLoaded - Forzado scroll top');
    });
    
    window.addEventListener('load', () => {
        setTimeout(forceScrollTop, 100);
        console.log('✅ Window load - Forzado scroll top');
    });
    
    // 6. INTERCEPTAR CUALQUIER SCROLL DURANTE LOS PRIMEROS 2 SEGUNDOS
    let preventScrollUntil = Date.now() + 2000; // 2 segundos
    
    const scrollInterceptor = (e) => {
        if (Date.now() < preventScrollUntil) {
            // Solo prevenir scroll automático, no scroll manual del usuario
            if (!e.isTrusted) {
                console.log('🚫 Prevenido scroll automático');
                e.preventDefault();
                forceScrollTop();
                return false;
            }
        }
    };
    
    window.addEventListener('scroll', scrollInterceptor, { passive: false });
    
    // 7. CLEANUP DESPUÉS DE 2 SEGUNDOS
    setTimeout(() => {
        window.removeEventListener('scroll', scrollInterceptor);
        console.log('✅ Fix de scroll automático completado');
    }, 2000);
    
    console.log('✅ Fix de scroll automático inicializado');
})();