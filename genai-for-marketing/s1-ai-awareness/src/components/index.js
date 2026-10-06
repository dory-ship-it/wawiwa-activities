// Screen components by type. P1 ships the cover and a placeholder; P2 adds the rest
// (media-text, timeline-slider, reveal, carousel, audio-hotspots, youtube, drag-drop, table, agenda, finale).
import { coverVideo } from './cover-video.js';
import { placeholder } from './placeholder.js';

export const components = {
  'cover-video': coverVideo,
  placeholder,
};
