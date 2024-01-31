import CollectionPage from "./pages/CollectionPage.svelte";
import HomePage from "./pages/HomePage.svelte";

const routes = {
  "/": HomePage,
  "/collection/:id": CollectionPage,
};

export default routes;
