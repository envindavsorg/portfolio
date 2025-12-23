'use client';

import type React from 'react';
import { AppleHelloEffect } from '@/registry/apple-hello-effect';

const AppleHelloEffectDemo = (): React.JSX.Element => (
	<div className="flex min-h-64 items-center justify-center">
		<AppleHelloEffect className="text-foreground" speed={0.8} />
	</div>
);

export default AppleHelloEffectDemo;
