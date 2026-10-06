// Screen components by type. The cover has its own component; every other screen is drawn by the
// generic renderer from src/screens/layout.json (design) and content/s1.json (words, images, media).
import { coverVideo } from './cover-video.js';
import { genericScreen } from '../screen.js';
import { placeholder } from './placeholder.js';

export const components = {
  'cover-video': coverVideo,
  placeholder,
};
for (const t of ['media-text', 'section', 'agenda', 'timeline-slider', 'reveal', 'carousel', 'audio-hotspots', 'youtube', 'drag-drop', 'table', 'finale']) components[t] = genericScreen;
