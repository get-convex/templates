import { tanstackConfig } from '@tanstack/eslint-config';
import convexPlugin from '@convex-dev/eslint-plugin';

export default [...tanstackConfig, ...convexPlugin.configs.recommended];
