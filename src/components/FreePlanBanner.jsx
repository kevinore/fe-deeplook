/**
 * Sticky upgrade strip shown below the topbar on every dashboard page when
 * the active plan is `free`. Single visual entry point that follows the user
 * across pages, so they never need to dig into Settings to find a CTA.
 *
 * Pairs with the topbar plan pill (also a CTA for free users) and the
 * RenewalBanner (which displaces this one when present, since RenewalBanner
 * implies an active paid plan that is expiring).
 */
const FreePlanBanner = ({ plan, onUpgrade }) => {
  if (plan !== 'free') return null;

  return (
    <>
      <style>{`
        @keyframes freePlanFadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .free-plan-banner {
          position: sticky; top: 68px; z-index: 90;
          background: linear-gradient(135deg, #5b54e8 0%, #7c3aed 100%);
          color: white;
          padding: 11px 24px;
          display: flex; align-items: center; gap: 14px;
          flex-wrap: wrap;
          /* Soft inner highlight at the top + hairline shadow at the bottom
             blend the banner into the surrounding chrome instead of slabbing. */
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.10),
            inset 0 -1px 0 rgba(14,7,73,0.08),
            0 6px 20px -8px rgba(79,70,229,0.35);
          animation: freePlanFadeIn 320ms cubic-bezier(0.16,1,0.3,1);
        }
        .free-plan-banner__icon {
          width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
          background: rgba(255,255,255,0.16);
          display: flex; align-items: center; justify-content: center;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
        }
        .free-plan-banner__text { flex: 1; min-width: 200px; line-height: 1.35; }
        .free-plan-banner__title {
          font-size: 13.5px; font-weight: 700; letter-spacing: -0.005em;
        }
        .free-plan-banner__sub {
          font-size: 12px; color: rgba(255,255,255,0.72); margin-top: 1px;
        }
        .free-plan-banner__btn {
          background: white; color: #4f46e5;
          border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 13px;
          padding: 8px 18px; border-radius: 8px; white-space: nowrap;
          transition: transform 180ms ease, box-shadow 220ms ease;
          box-shadow: 0 2px 8px rgba(14,7,73,0.18);
        }
        .free-plan-banner__btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(14,7,73,0.22);
        }
        @media (max-width: 640px) {
          .free-plan-banner { padding: 10px 16px; gap: 10px; }
          .free-plan-banner__sub { display: none; }
        }
      `}</style>

      <div className="free-plan-banner">
        <div className="free-plan-banner__icon">
          {/* Sparkles / upgrade glyph */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2z" />
            <path d="M19 14l.8 2.7L22.5 17l-2.7.8L19 20l-.8-2.7L15.5 17l2.7-.8L19 14z" opacity="0.7" />
          </svg>
        </div>

        <div className="free-plan-banner__text">
          <div className="free-plan-banner__title">
            Estás en el plan gratis · Activa un plan para generar reportes
          </div>
          <div className="free-plan-banner__sub">
            Desde $160.000 COP/mes — primer reporte en minutos. Cancela cuando quieras.
          </div>
        </div>

        <button className="free-plan-banner__btn" onClick={onUpgrade}>
          Ver planes →
        </button>
      </div>
    </>
  );
};

export default FreePlanBanner;
