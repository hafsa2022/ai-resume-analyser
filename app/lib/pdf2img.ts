// export interface PdfConversionResult {
//     imageUrl: string;
//     file: File | null;
//     error?: string;
// }
//
// let pdfjsLib: any = null;
// let isLoading = false;
// let loadPromise: Promise<any> | null = null;
//
// async function loadPdfJs(): Promise<any> {
//     if (pdfjsLib) return pdfjsLib;
//     if (loadPromise) return loadPromise;
//
//     isLoading = true;
//     // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
//     loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
//         // Set the worker source to use local file
//         lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
//         pdfjsLib = lib;
//         isLoading = false;
//         return lib;
//     });
//
//     return loadPromise;
// }
//
// export async function convertPdfToImage(
//     file: File
// ): Promise<PdfConversionResult> {
//     try {
//         const lib = await loadPdfJs();
//
//         const arrayBuffer = await file.arrayBuffer();
//         const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
//         const page = await pdf.getPage(1);
//
//         const viewport = page.getViewport({ scale: 4 });
//         const canvas = document.createElement("canvas");
//         const context = canvas.getContext("2d");
//
//         canvas.width = viewport.width;
//         canvas.height = viewport.height;
//
//         if (context) {
//             context.imageSmoothingEnabled = true;
//             context.imageSmoothingQuality = "high";
//         }
//
//         await page.render({ canvasContext: context!, viewport }).promise;
//
//         return new Promise((resolve) => {
//             canvas.toBlob(
//                 (blob) => {
//                     if (blob) {
//                         // Create a File from the blob with the same name as the pdf
//                         const originalName = file.name.replace(/\.pdf$/i, "");
//                         const imageFile = new File([blob], `${originalName}.png`, {
//                             type: "image/png",
//                         });
//
//                         resolve({
//                             imageUrl: URL.createObjectURL(blob),
//                             file: imageFile,
//                         });
//                     } else {
//                         resolve({
//                             imageUrl: "",
//                             file: null,
//                             error: "Failed to create image blob",
//                         });
//                     }
//                 },
//                 "image/png",
//                 1.0
//             ); // Set quality to maximum (1.0)
//         });
//     } catch (err) {
//         return {
//             imageUrl: "",
//             file: null,
//             error: `Failed to convert PDF: ${err}`,
//         };
//     }
// }

// src/lib/pdf2img.ts

export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

/**
 * Charge PDF.js dynamiquement et configure le worker
 */
async function loadPdfJs() {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
        // Indique au worker le fichier .mjs dans public/
        lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        pdfjsLib = lib;
        return lib;
    });

    return loadPromise;
}

/**
 * Convertit la première page d'un PDF en image PNG
 * @param file Fichier PDF à convertir
 */
export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {
    try {
        const lib = await loadPdfJs();

        const arrayBuffer = await file.arrayBuffer();

        // Charger le document PDF
        const pdf = await lib.getDocument({ data: arrayBuffer }).promise;

        // Prendre la première page
        const page = await pdf.getPage(1);

        // Définir l'échelle pour le rendu
        const viewport = page.getViewport({ scale: 4 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (context) {
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = "high";
        }

        // Rendu de la page sur le canvas
        await page.render({ canvasContext: context!, viewport }).promise;

        // Convertir le canvas en blob et créer un File
        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const originalName = file.name.replace(/\.pdf$/i, "");
                        const imageFile = new File([blob], `${originalName}.png`, {
                            type: "image/png",
                        });

                        resolve({
                            imageUrl: URL.createObjectURL(blob),
                            file: imageFile,
                        });
                    } else {
                        resolve({
                            imageUrl: "",
                            file: null,
                            error: "Failed to create image blob",
                        });
                    }
                },
                "image/png",
                1.0
            );
        });
    } catch (err) {
        return {
            imageUrl: "",
            file: null,
            error: `Failed to convert PDF: ${err}`,
        };
    }
}
