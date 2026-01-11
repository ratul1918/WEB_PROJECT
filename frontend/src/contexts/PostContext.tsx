import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Post } from '../types/auth';

interface PostContextType {
    posts: Post[];
    addPost: (post: Omit<Post, 'id' | 'uploadDate' | 'status' | 'views' | 'rating'>) => void;
    approvePost: (id: string) => void;
    rejectPost: (id: string) => void;
    deletePost: (id: string) => void;
    getPostsByStatus: (status: Post['status']) => Post[];
    getPostsByType: (type: Post['type']) => Post[];
}

const PostContext = createContext<PostContextType | null>(null);

const STORAGE_KEY = 'uiu_posts_db_v5';

// Initial Mock Data (Restored & Expanded)
const INITIAL_POSTS: Post[] = [
    // --- VIDEO POSTS ---
    {
        id: 'v1',
        title: 'Introduction to Web Development',
        authorId: 'creator-2',
        authorName: 'Sarah Johnson',
        authorRole: 'creator',
        type: 'video',
        thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400',
        rating: 4.8,
        views: 1520,
        duration: '12:34',
        uploadDate: new Date('2024-12-05'),
        status: 'approved'
    },
    {
        id: 'v2',
        title: 'Cinematic Travel Vlog: Japan',
        authorId: 'creator-3',
        authorName: 'Mike Chen',
        authorRole: 'creator',
        type: 'video',
        thumbnail: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=400',
        rating: 4.9,
        views: 3420,
        duration: '18:45',
        uploadDate: new Date('2024-12-04'),
        status: 'approved'
    },
    {
        id: 'v3',
        title: 'UIU Campus Tour 2024',
        authorId: 'creator-2',
        authorName: 'Campus Media',
        authorRole: 'creator',
        type: 'video',
        thumbnail: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400',
        rating: 4.7,
        views: 5600,
        duration: '08:20',
        uploadDate: new Date('2024-12-02'),
        status: 'approved'
    },
    // REPLACED 'Short Film: The Last Assignment' with new content
    {
        id: 'v6',
        title: 'Digital Art Showcase',
        authorId: 'creator-4',
        authorName: 'Creative Arts Club',
        authorRole: 'creator',
        type: 'video',
        thumbnail: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=400', // Confirmed Landscape Art
        rating: 4.8,
        views: 1950,
        duration: '06:15',
        uploadDate: new Date('2024-12-07'),
        status: 'approved'
    },
    {
        id: 'v7',
        title: 'Robotics Competition Finals',
        authorId: 'creator-6',
        authorName: 'Robotics Team',
        authorRole: 'creator',
        type: 'video',
        thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400', // Confirmed Landscape Robot
        rating: 4.9,
        views: 4200,
        duration: '14:30',
        uploadDate: new Date('2024-12-08'),
        status: 'approved'
    },
    {
        id: 'v5',
        title: 'Tech Fest 2024 Highlights',
        authorId: 'creator-3',
        authorName: 'Tech Club',
        authorRole: 'creator',
        type: 'video',
        thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400',
        rating: 4.6,
        views: 2800,
        duration: '04:55',
        uploadDate: new Date('2024-11-30'),
        status: 'approved'
    },

    // --- AUDIO POSTS ---
    {
        id: 'a1',
        title: 'The Future of Technology Podcast',
        authorId: 'creator-2',
        authorName: 'David Kumar',
        authorRole: 'creator',
        type: 'audio',
        thumbnail: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400',
        rating: 4.7,
        views: 2100,
        duration: '45:20',
        uploadDate: new Date('2024-12-05'),
        status: 'approved'
    },
    {
        id: 'a2',
        title: 'Lofi Study Beats Mix',
        authorId: 'creator-5',
        authorName: 'Chill Vibes',
        authorRole: 'creator',
        type: 'audio',
        thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
        rating: 4.8,
        views: 5400,
        duration: '60:00',
        uploadDate: new Date('2024-12-03'),
        status: 'approved'
    },
    {
        id: 'a3',
        title: 'University Radio: Morning Show',
        authorId: 'creator-5',
        authorName: 'UIU Radio',
        authorRole: 'creator',
        type: 'audio',
        thumbnail: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=400',
        rating: 4.5,
        views: 890,
        duration: '25:15',
        uploadDate: new Date('2024-12-06'),
        status: 'approved'
    },
    {
        id: 'a4',
        title: 'Indie Band Spotlight: The Echoes',
        authorId: 'creator-2',
        authorName: 'David Kumar',
        authorRole: 'creator',
        type: 'audio',
        thumbnail: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400',
        rating: 4.9,
        views: 1250,
        duration: '12:45',
        uploadDate: new Date('2024-12-01'),
        status: 'approved'
    },
    {
        id: 'a5',
        title: 'Meditation & Mindfulness',
        authorId: 'creator-6',
        authorName: 'Mindful Space',
        authorRole: 'creator',
        type: 'audio',
        thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
        rating: 4.8,
        views: 3100,
        duration: '20:00',
        uploadDate: new Date('2024-11-28'),
        status: 'approved'
    },

    // --- BLOG POSTS ---
    {
        id: 'b1',
        title: 'The Evolution of Modern Architecture',
        authorId: 'creator-2',
        authorName: 'Sarah Johnson',
        authorRole: 'creator',
        type: 'blog',
        thumbnail: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400',
        rating: 4.8,
        views: 1250,
        uploadDate: new Date('2024-12-05'),
        status: 'approved',
        description: 'Exploring the shift from brutalism to sustainable design in the 21st century.',
        duration: '5 min read'
    },
    {
        id: 'b2',
        title: 'Top 10 Coding Practices for 2025',
        authorId: 'creator-3',
        authorName: 'Mike Chen',
        authorRole: 'creator',
        type: 'blog',
        thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
        rating: 4.9,
        views: 2400,
        uploadDate: new Date('2024-12-04'),
        status: 'approved',
        description: 'A comprehensive guide to writing clean, maintainable, and efficient code in the modern era.',
        duration: '8 min read'
    },
    {
        id: 'b3',
        title: 'Student Life: Balancing Work & Play',
        authorId: 'creator-7',
        authorName: 'Emily Clark',
        authorRole: 'creator',
        type: 'blog',
        thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400',
        rating: 4.7,
        views: 1800,
        uploadDate: new Date('2024-12-02'),
        status: 'approved',
        description: 'Tips and tricks for managing your time effectively while enjoying the college experience.',
        duration: '6 min read'
    },
    {
        id: 'b4',
        title: 'The Art of Minimalist Photography',
        authorId: 'creator-4',
        authorName: 'Film Guys',
        authorRole: 'creator',
        type: 'blog',
        thumbnail: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=400',
        rating: 4.8,
        views: 950,
        uploadDate: new Date('2024-11-29'),
        status: 'approved',
        description: 'How to capture stunning images using negative space and simple compositions.',
        duration: '4 min read'
    },
    {
        id: 'b5',
        title: 'Campus Food Review: Hidden Gems',
        authorId: 'creator-5',
        authorName: 'Foodie Squad',
        authorRole: 'creator',
        type: 'blog',
        thumbnail: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
        rating: 4.6,
        views: 3200,
        uploadDate: new Date('2024-12-06'),
        status: 'approved',
        description: 'We tasted everything on campus so you don\'t have to. Here are our top picks.',
        duration: '7 min read'
    }
];

export const usePosts = () => {
    const context = useContext(PostContext);
    if (!context) {
        throw new Error('usePosts must be used within PostProvider');
    }
    return context;
};

interface PostProviderProps {
    children: ReactNode;
}

export function PostProvider({ children }: PostProviderProps) {
    const [posts, setPosts] = useState<Post[]>([]);

    // Load from Storage
    useEffect(() => {
        const storedPosts = localStorage.getItem(STORAGE_KEY);
        if (storedPosts) {
            // Need to re-hydrate Dates
            const parsedPosts = JSON.parse(storedPosts).map((p: any) => ({
                ...p,
                uploadDate: new Date(p.uploadDate),
                status: p.status || 'approved' // Backwards compatibility if needed
            }));
            setPosts(parsedPosts);
        } else {
            setPosts(INITIAL_POSTS);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_POSTS));
        }
    }, []);

    // Save to Storage
    useEffect(() => {
        if (posts.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
        }
    }, [posts]);

    const addPost = (newPostData: Omit<Post, 'id' | 'uploadDate' | 'status' | 'views' | 'rating'>) => {
        const newPost: Post = {
            ...newPostData,
            id: `${newPostData.type}-${Date.now()}`,
            uploadDate: new Date(),
            status: 'pending', // Default to pending
            views: 0,
            rating: 0,
        };
        setPosts(prev => [newPost, ...prev]);
    };

    const approvePost = (id: string) => {
        setPosts(prev => prev.map(post =>
            post.id === id ? { ...post, status: 'approved' } : post
        ));
    };

    const rejectPost = (id: string) => {
        setPosts(prev => prev.map(post =>
            post.id === id ? { ...post, status: 'rejected' } : post
        ));
    };

    const deletePost = (id: string) => {
        setPosts(prev => prev.filter(post => post.id !== id));
    };

    const getPostsByStatus = (status: Post['status']) => {
        return posts.filter(post => post.status === status);
    };

    const getPostsByType = (type: Post['type']) => {
        return posts.filter(post => post.type === type);
    };

    return (
        <PostContext.Provider value={{
            posts,
            addPost,
            approvePost,
            rejectPost,
            deletePost,
            getPostsByStatus,
            getPostsByType
        }}>
            {children}
        </PostContext.Provider>
    );
}
