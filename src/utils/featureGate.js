// ==================== Feature Gate Utility ====================
// Project is now Open Source & 100% Free. All routes are unlocked.

export function checkRouteAccess(route) {
    // Always return true to allow access to all features
    return true;
}

export function showUpgradeModal() {
    // No longer needed
    console.log("App is 100% free. No upgrades required.");
}

export function getNavWithLocks() {
    // Return all nav items without any locks
    return [
        { label: 'Home',            icon: '🏠', href: '#/',                route: '/'               },
        { label: 'Bio Generator',   icon: '✨', href: '#/generator',       route: '/generator'      },
        { label: 'Smart Hashtags',  icon: '#️⃣', href: '#/smart-hashtags', route: '/smart-hashtags' },
        { label: 'Caption Studio',  icon: '✍️', href: '#/captions',        route: '/captions'       },
        { label: 'Username Finder', icon: '🔍', href: '#/username',        route: '/username'       },
        { label: 'Profile Audit',   icon: '📋', href: '#/audit',           route: '/audit'          },
        { label: 'Hook Generator',  icon: '🔥', href: '#/hooks',           route: '/hooks'          },
        { label: 'Templates',       icon: '📁', href: '#/templates',       route: '/templates'      },
        { label: 'Reel Script',     icon: '🎬', href: '#/reel-script',     route: '/reel-script'    },
        { label: 'Story Ideas',     icon: '📱', href: '#/story-ideas',     route: '/story-ideas'    },
        { label: 'Bulk Generator',  icon: '📦', href: '#/bulk-generator',  route: '/bulk-generator' },
        { label: 'Saved',           icon: '💾', href: '#/saved',           route: '/saved'          },
        { label: 'Dashboard',       icon: '📊', href: '#/dashboard',       route: '/dashboard'      },
    ];
}

