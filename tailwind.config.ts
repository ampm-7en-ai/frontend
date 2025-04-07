import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '0.75rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#0066FF',
					foreground: '#FFFFFF',
					hover: '#004ECC',
				},
				secondary: {
					DEFAULT: '#F5F6F7',
					foreground: '#1A1A1A',
				},
				accent: {
					DEFAULT: '#F0F7FF',
					foreground: '#0066FF',
				},
				destructive: {
					DEFAULT: '#FF3B30',
					foreground: '#FFFFFF',
				},
				muted: {
					DEFAULT: '#F5F6F7',
					foreground: '#71767C',
				},
				success: {
					DEFAULT: '#34C759',
					foreground: '#FFFFFF',
				},
				warning: {
					DEFAULT: '#FF9500',
					foreground: '#FFFFFF',
				},
				info: {
					DEFAULT: '#0066FF',
					foreground: '#FFFFFF',
				},
				popover: {
					DEFAULT: '#FFFFFF',
					foreground: '#1A1A1A',
				},
				card: {
					DEFAULT: '#FFFFFF',
					foreground: '#1A1A1A',
				},
				// Neutrals
				white: '#FFFFFF',
				'light-gray': '#F5F6F7',
				'medium-gray': '#E1E4E8',
				'dark-gray': '#71767C',
				black: '#1A1A1A',
				// Blues
				blue: {
					50: '#F0F7FF',
					100: '#DEEAFF',
					200: '#B8D5FF',
					300: '#91BFFF',
					400: '#5C9AFF',
					500: '#0066FF',
					600: '#004ECC',
					700: '#003A99',
					800: '#002666',
					900: '#001333',
				},
			},
			borderRadius: {
				lg: '0.5rem',
				md: '0.375rem',
				sm: '0.25rem',
			},
			fontSize: {
				'heading-1': '1.5rem',    // 24px
				'heading-2': '1.25rem',   // 20px
				'heading-3': '1.125rem',  // 18px
				'heading-4': '1rem',      // 16px
				'body': '0.875rem',       // 14px
				'small': '0.75rem',       // 12px
				'micro': '0.625rem',      // 10px
			},
			fontWeight: {
				normal: '400',
				medium: '500',
				semibold: '600',
				bold: '700',
			},
			fontFamily: {
				'inter': ['Inter', 'sans-serif'],
				'mono': ['IBM Plex Mono', 'monospace'],
			},
			spacing: {
				'1': '4px',
				'1.5': '6px',
				'2': '8px',
				'2.5': '10px',
				'3': '12px',
				'3.5': '14px',
				'4': '16px',
				'5': '20px',
				'6': '24px',
				'8': '32px',
				'10': '40px',
				'12': '48px',
				'16': '64px',
			},
			boxShadow: {
				'card': '0 1px 2px rgba(0, 0, 0, 0.05)',
				'dropdown': '0 2px 8px rgba(0, 0, 0, 0.05)',
				'sidebar': '0 0 5px rgba(0, 0, 0, 0.03)',
				'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'pulse': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' },
				},
				'collapsible-down': {
					"0%": { height: "0", opacity: "0" },
					"100%": { height: "var(--radix-collapsible-content-height)", opacity: "1" },
				},
				'collapsible-up': {
					"0%": { height: "var(--radix-collapsible-content-height)", opacity: "1" },
					"100%": { height: "0", opacity: "0" },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'collapsible-down': 'collapsible-down 0.2s ease-out',
				'collapsible-up': 'collapsible-up 0.2s ease-out',
			},
			backgroundImage: {
				'blue-gradient': 'linear-gradient(90deg, #0066FF 0%, #0052CC 100%)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
