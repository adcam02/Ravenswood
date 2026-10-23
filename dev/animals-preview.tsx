// Mounts AnimalPreview and the thumbnails, as the animal picker will.
import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimalPreview } from '../src/world/AnimalPreview';
import { animalThumbnail } from '../src/world/animals';
import { ANIMALS, type Look } from '../src/world/types';

function App() {
  const [look, setLook] = useState<Look>({ animal: 'fox', color: '#e2793a' });
  useEffect(() => {
    const t = setTimeout(() => setLook({ animal: 'axolotl', color: '#b494dd' }), 1200);
    (window as unknown as { ready: boolean }).ready = true;
    return () => clearTimeout(t);
  }, []);
  return (
    <div>
      <div className="row">
        <AnimalPreview look={look} size={280} />
        <AnimalPreview look={{ animal: 'panda', color: '#f4efe6' }} size={200} anim="wave" spin={false} />
      </div>
      <div className="row">
        {ANIMALS.map((a) => (
          <img key={a.id} src={animalThumbnail({ animal: a.id, color: a.colors[0] }, 128)} alt={a.name} />
        ))}
      </div>
    </div>
  );
}
createRoot(document.getElementById('root')!).render(<App />);
