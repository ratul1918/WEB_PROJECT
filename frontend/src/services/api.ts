// Types imported but implicitly used in API responses or future typings

const BASE_URL = 'http://localhost:8000/api'; // Adjust port if needed

const getAuthHeaders = (): HeadersInit => {
    const userStr = localStorage.getItem('uiu_auth_user');
    if (userStr) {
        try {
            const token = localStorage.getItem('uiu_auth_token');
            if (token) {
                return { 'Authorization': `Bearer ${token}` };
            }
        } catch (e) {
            console.error("Error parsing user for auth", e);
        }
    }
    return {};
};

export const api = {
    auth: {
        login: async (email: string, password: string) => {
            console.log("Attempting login via API:", `${BASE_URL}/auth/login.php`);
            try {
                const response = await fetch(`${BASE_URL}/auth/login.php`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                console.log("Login Response Status:", response.status);

                if (!response.ok) {
                    const text = await response.text();
                    console.error("Login Error Body:", text);
                    try {
                        const errorData = JSON.parse(text);
                        throw new Error(errorData.message || 'Login failed');
                    } catch (e) {
                        throw new Error(`Login failed with status ${response.status}: ${text.substring(0, 50)}...`);
                    }
                }

                const data = await response.json();
                console.log("Login Success Data:", data);
                return data;
            } catch (error) {
                console.error("Fetch/Parse Error in api.ts:", error);
                throw error;
            }
        },
        register: async (name: string, email: string, password: string, role: string) => {
            const response = await fetch(`${BASE_URL}/auth/register.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role }),
            });
            if (!response.ok) throw new Error('Registration failed');
            return response.json();
        }
    },
    posts: {
        list: async (type?: string) => {
            const url = type
                ? `${BASE_URL}/posts/list.php?type=${type}`
                : `${BASE_URL}/posts/list.php`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch posts');
            return response.json();
        },
        listMine: async () => {
            const response = await fetch(`${BASE_URL}/posts/list.php?mine=1`, {
                headers: {
                    ...getAuthHeaders(),
                }
            });
            if (!response.ok) throw new Error('Failed to fetch my posts');
            return response.json();
        },
        listByAuthor: async (authorId: string) => {
            const url = `${BASE_URL}/posts/list.php?author_id=${encodeURIComponent(authorId)}&status=approved`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch creator posts');
            return response.json();
        },
        create: async (formData: FormData) => {
            const response = await fetch(`${BASE_URL}/posts/create.php`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(), // Don't set Content-Type for FormData, browser does it
                },
                body: formData,
            });
            if (!response.ok) {
                const text = await response.text();
                try {
                    const errorData = JSON.parse(text);
                    throw new Error(errorData.error || errorData.message || 'Failed to create post');
                } catch (e) {
                    throw new Error(text || 'Failed to create post');
                }
            }
            return response.json();
        },
        delete: async (id: string) => {
            const response = await fetch(`${BASE_URL}/posts/delete.php?id=${id}`, {
                method: 'DELETE',
                headers: {
                    ...getAuthHeaders() as any,
                },
            });
            if (!response.ok) throw new Error('Failed to delete post');
            return response.json();
        },
        updateStatus: async (id: string, status: 'pending' | 'approved' | 'rejected') => {
            const response = await fetch(`${BASE_URL}/posts/update_status.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders() as any
                },
                body: JSON.stringify({ id, status }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update status');
            }
            return response.json();
        },
        vote: async (id: string) => {
            const response = await fetch(`${BASE_URL}/posts/vote.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders() as any
                },
                body: JSON.stringify({ post_id: id }),
            });
            if (!response.ok) throw new Error('Failed to vote');
            return response.json();
        },
        incrementView: async (id: string) => {
            const response = await fetch(`${BASE_URL}/posts/increment_view.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ post_id: id }),
            });
            if (!response.ok) throw new Error('Failed to increment view');
            return response.json();
        },
        // User Voting
        voteUser: async (candidateId: string) => {
            console.log("📤 API voteUser called with candidateId:", candidateId);
            const response = await fetch(`${BASE_URL}/users/vote.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders() as any
                },
                body: JSON.stringify({ candidate_id: candidateId }),
            });
            console.log("🔄 API response status:", response.status);
            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ API error response:", errorText);
                throw new Error(`Failed to vote for user: ${errorText}`);
            }
            const data = await response.json();
            console.log("✅ API response data:", data);
            return data;
        },
        getUserVotes: async () => {
            const response = await fetch(`${BASE_URL}/users/votes_list.php`, {
                headers: { ...getAuthHeaders() as any }
            });
            if (!response.ok) throw new Error('Failed to fetch user votes');
            return response.json();
        }
    },
    users: {
        searchCreators: async (query: string) => {
            const response = await fetch(`${BASE_URL}/users/search.php?q=${encodeURIComponent(query)}`, {
                headers: { ...getAuthHeaders() as any }
            });
            if (!response.ok) throw new Error('Failed to search creators');
            return response.json();
        },
        getCreator: async (id: string) => {
            const response = await fetch(`${BASE_URL}/users/get.php?id=${encodeURIComponent(id)}`);
            if (!response.ok) throw new Error('Failed to fetch creator');
            return response.json();
        },
        getLikedContent: async (userId: string) => {
            const url = `${BASE_URL}/users/liked_content.php?user_id=${encodeURIComponent(userId)}`;
            console.log('📡 Fetching liked content from:', url);
            const headers = getAuthHeaders();
            console.log('📡 Auth headers:', headers);

            const response = await fetch(url, {
                headers: { ...headers }
            });

            console.log('📡 Liked content response status:', response.status);

            if (!response.ok) {
                const text = await response.text();
                console.error('📡 Error response body:', text);
                throw new Error('Failed to fetch liked content');
            }

            const data = await response.json();
            console.log('📡 Liked content data:', data);
            return data;
        },
        updateProfile: async (data: any) => {
            const response = await fetch(`${BASE_URL}/users/update.php`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders() as any
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const text = await response.text();
                try {
                    const errorData = JSON.parse(text);
                    throw new Error(errorData.error || 'Failed to update profile');
                } catch (e) {
                    throw new Error('Failed to update profile');
                }
            }
            return response.json();
        }
    }
};
