export const PulsatingCircle = () => (
  <span className="relative flex items-center justify-center">
    {/* `motion-safe` : le halo bat à l'infini, et rien ne l'arrêtait pour
        qui a demandé moins d'animations. Le point plein reste. */}
    <span className="absolute inline-flex size-3 rounded-full bg-theme opacity-50 motion-safe:animate-ping" />
    <span className="relative inline-flex size-2 rounded-full bg-theme" />
  </span>
);
