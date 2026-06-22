export function startTour() {
    if (!window.driver) {
        console.warn("driver.js is not loaded.");
        return;
    }

    const driverObj = window.driver.js.driver({
        showProgress: true,
        animate: true,
        steps: [
            {
                popover: {
                    title: 'Welcome to Crealix AI! ✦',
                    description: 'Let us take a quick tour to show you how to maximize your AI social media studio.',
                    side: "bottom",
                    align: 'start'
                }
            },
            {
                element: '#sidebar',
                popover: {
                    title: 'Navigation Hub',
                    description: 'Access all your creative tools here. From Bio Generator to AI Image Studio, everything is one click away.',
                    side: "right",
                    align: 'start'
                }
            },
            {
                element: '.dashboard-grid',
                popover: {
                    title: 'Your Workspace Stats',
                    description: 'Keep track of your Daily API Requests, Saved Assets, and your current Plan Tier right here.',
                    side: "bottom",
                    align: 'start'
                }
            },
            {
                element: '.creator-quick-grid',
                popover: {
                    title: 'Workspace Apps',
                    description: 'Quickly jump into creating content. These shortcuts bring you straight to our most popular generators.',
                    side: "top",
                    align: 'center'
                }
            },
            {
                element: '#sidebar-settings-btn',
                popover: {
                    title: 'Custom Brand Voice & Settings',
                    description: 'Important! Click here later to set your Brand Voice. It ensures all AI outputs sound exactly like you. You can also update security settings here.',
                    side: "right",
                    align: 'end'
                }
            },
            {
                popover: {
                    title: 'You are all set! 🚀',
                    description: 'Start generating incredible content for your social media.',
                    side: "bottom",
                    align: 'start'
                }
            }
        ],
        onDestroyStarted: () => {
            if (!driverObj.hasNextStep() || confirm("Are you sure you want to skip the tour?")) {
                driverObj.destroy();
            }
        },
    });

    driverObj.drive();
}
