/** @type {import("tailwindcss").Config} */
module.exports = {
	content: ["./ui/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
	darkMode: "media",
	theme: {
		extend: {
			opacity: {
				1: "0.01",
				2.5: "0.025",
				7.5: "0.075",
				15: "0.15",
			},
			boxShadow: {
				glow: "0 0 4px rgb(0 0 0 / 0.1)",
			},
			keyframes: {
				slideDownAndFade: {
					from: { opacity: 0, transform: "translateY(-2px)" },
					to: { opacity: 1, transform: "translateY(0)" },
				},
				slideLeftAndFade: {
					from: { opacity: 0, transform: "translateX(2px)" },
					to: { opacity: 1, transform: "translateX(0)" },
				},
				slideUpAndFade: {
					from: { opacity: 0, transform: "translateY(2px)" },
					to: { opacity: 1, transform: "translateY(0)" },
				},
				slideRightAndFade: {
					from: { opacity: 0, transform: "translateX(-2px)" },
					to: { opacity: 1, transform: "translateX(0)" },
				},
			},
			animation: {
				slideDownAndFade:
					"slideDownAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
				slideLeftAndFade:
					"slideLeftAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
				slideUpAndFade:
					"slideUpAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
				slideRightAndFade:
					"slideRightAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
			},
		},
	},
};

