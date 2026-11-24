import { useEffect, useState } from 'react';

/**
 * The id of the section currently being read, for "you are here" sidebars.
 * A section counts as current once its top passes ~a third of the way down.
 */
export default function useScrollSpy(ids) {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join('|');

  useEffect(() => {
    const list = key.split('|');
    const onScroll = () => {
      const line = window.innerHeight / 3;
      let current = list[0];
      for (const id of list) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [key]);

  return active;
}
