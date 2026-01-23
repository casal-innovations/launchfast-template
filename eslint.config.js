import { default as defaultConfig } from '@epic-web/config/eslint'

/** @type {import("eslint").Linter.Config} */
export default [
	...defaultConfig,
	// add custom config objects here:
	{
		// Playwright test files use `use` as a fixture parameter name, which
		// conflicts with React 19's `use()` hook detection in eslint-plugin-react-hooks
		files: ['tests/**/*.ts'],
		rules: {
			'react-hooks/rules-of-hooks': 'off',
		},
	},
]
