/**
 * YouTube URL Parser Utility
 * Extracts video ID from various YouTube URL formats
 */

/**
 * Extract YouTube video ID from URL
 * Supports formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 */
export const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    const videoId = match?.[1];
    return videoId ?? null;
};

/**
 * Validate if URL is a valid YouTube URL
 */
export const validateYouTubeUrl = (url: string): boolean => {
    return extractYouTubeId(url) !== null;
};

/**
 * Get YouTube embed URL from video ID
 */
export const getYouTubeEmbedUrl = (videoId: string): string => {
    return `https://www.youtube.com/embed/${videoId}`;
};

/**
 * Get YouTube thumbnail URL from video ID
 */
export const getYouTubeThumbnail = (videoId: string, quality: 'default' | 'hq' | 'mq' | 'sd' | 'maxres' = 'hq'): string => {
    const qualityMap = {
        'default': 'default',
        'mq': 'mqdefault',
        'hq': 'hqdefault',
        'sd': 'sddefault',
        'maxres': 'maxresdefault'
    };
    return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
};

/**
 * Parse YouTube URL and return all useful data
 */
export const parseYouTubeUrl = (url: string) => {
    const videoId = extractYouTubeId(url);
    if (!videoId) return null;
    
    return {
        videoId,
        embedUrl: getYouTubeEmbedUrl(videoId),
        thumbnailUrl: getYouTubeThumbnail(videoId),
        watchUrl: `https://www.youtube.com/watch?v=${videoId}`
    };
};
