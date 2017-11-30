module.exports = {
    theme: {
        maxWidth: '100%',
        sidebarWidth: 250,
        color: {
            link: '#5856d6',
            linkHover: 'rgb(70, 69, 171)',
            baseBackground: '#fff',
            sidebarBackground: '#1e1e1e',
            codeBackground: '#f5f5f5',
            errorBackground: '#e22d44'
        },
        fontSize: {
            base: 15,
            text: 16
        },
        fontFamily: {
            base: 'Tahoma, Geneva, sans-serif'
        }
    },
    styles: {
        body: {
            isolate: false,
            margin: 0,
            padding: 0,
            border: 0
        },
        StyleGuide: {
            root: {
                'text-rendering': 'optimizeLegibility',
                '-moz-osx-font-smoothing': 'grayscale',
                '-webkit-font-smoothing': 'antialiased'
            },
            sidebar: {},
            content: {},
            logo: {
                border: 'none',
                paddingBottom: 0
            }
        },
        Logo: {
            logo: {
                animation: 'blink ease-in-out 300ms infinite',
                color: '#fff',
                fontSize: 24
            }
        },
        ComponentsList: {
            list: {
                //'& ul': {
                //    paddingLeft: 0
                //}
            },
            item: {
                '& a': {
                    'color': 'rgba(255, 255, 255, 0.9) !important',
                    'fontWeight': 500,
                    '&:hover': {
                        textDecoration: 'underline',
                        color: '#fff !important'
                    }
                }
            },
            heading: {
                fontSize: '18px !important',
                fontWeight: '600 !important',
                color: '#fff !important'
            }
        }
    }
}