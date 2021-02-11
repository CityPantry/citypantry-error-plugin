import App from './App.svelte';

const app = new App({
	target: document.body
});

const loader = document.getElementById('initial-loader') as Element;
(loader.parentElement as Element).removeChild(loader);

export default app;
