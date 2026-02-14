
"use client";

import { useState, useEffect } from "react";
import { fetchModels, fetchLoras } from "@/lib/api";

export function useModelSelectorLogic(selectedModel: string, onModelSelect: (m: string) => void) {
    const [models, setModels] = useState<string[]>([]);
    const [loras, setLoras] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const load = async () => {
            const m = await fetchModels();
            const l = await fetchLoras();
            setModels(m || []);
            setLoras(l || []);

            // Select first model if none selected and models available
            if (m?.length > 0 && selectedModel === "Loading...") {
                onModelSelect(m[0]);
            }
        };
        load();
    }, [selectedModel, onModelSelect]);

    const filteredModels = models.filter(m => m.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredLoras = loras.filter(l => l.toLowerCase().includes(searchTerm.toLowerCase()));

    return {
        models: filteredModels,
        loras: filteredLoras,
        searchTerm,
        setSearchTerm
    };
}
