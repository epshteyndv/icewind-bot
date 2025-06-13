import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import {Provider} from "@/components/ui/provider"
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {BrowserRouter, Route, Routes} from "react-router";
import {NotFoundPage} from "@/pages/NotFoundPage.tsx";
import {MainLayout} from "@/layouts/MainLayout.tsx";
import LogsPage from "@/pages/logs/LogsPage.tsx";
import LogPage from "@/pages/logs/LogPage.tsx";
import {CreateLogPage, UpdateLogPage} from "@/pages/logs/CreateLogPage.tsx";
import ArticlesPage from "@/pages/articles/ArticlesPage.tsx";

const rootElement = document.getElementById('root');
const queryClient = new QueryClient();

createRoot(rootElement!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout/>}>
              <Route index element={<LogsPage />} />
              <Route path="logs" element={<LogsPage />} />
              <Route path="logs/create" element={<CreateLogPage />} />
              <Route path="logs/:id" element={<LogPage />} />
              <Route path="logs/:id/edit" element={<UpdateLogPage />} />
              <Route path="articles" element={<ArticlesPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </QueryClientProvider>
  </StrictMode>,
)
