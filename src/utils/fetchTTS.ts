import { supabase } from "@/supabaseClient";

export async function fetchTTS(
    text: string,
    lang: string,
    speaker: string
): Promise<string> {
    const response = await fetch("https://api.sarvam.ai/text-to-speech", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "api-subscription-key": 'sk_ub6tmck1_GssLt4xToCdAjQGEgh3BJQKk', // from .env
        },
        body: JSON.stringify({
            text,
            model: "bulbul:v2",
            speaker,
            target_language_code: lang,
            pace: 0.8
        }),
    });

    if (!response.ok) {
        throw new Error("TTS request failed");
    }

    const data = await response.json();
    console.log(data.audios[0])
    return data.audios[0]; // base64 string
}




export async function generateAudio(
    text: string,
    lang: string,
    speaker: string
) {
    // 1. Get base64 audio from Sarvam API
    const base64Audio = await fetchTTS(text, lang, speaker);
    console.log(base64Audio)

    // 2. Convert base64 → File
    const audioBlob = base64ToBlob(base64Audio, "audio/wav");
    const fileName = `tts-${Date.now()}.wav`;
    const file = new File([audioBlob], fileName, { type: "audio/wav" });

    console.log(file);


    // 3. Upload to Supabase
    // const { fileUrl, duration, size } = await uploadAudio(file);
    // return { fileUrl, duration, size };
    return file;
}

// Convert base64 → Blob
function base64ToBlob(base64: string, mimeType: string): Blob {
    const byteChars = atob(base64);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}


// Upload audio to Supabase
export async function uploadAudio(file: File, audio:any,category:string, stopInfo,lang:String): Promise<{ fileUrl: string; size: number }> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${stopInfo}/${lang}/${fileName}`;

    // Upload
    const { error: uploadError } = await supabase.storage
        .from("audios")
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data } = supabase.storage.from("audios").getPublicUrl(filePath);
    const fileUrl = data.publicUrl;

    // Metadata
    const size = file.size;
    return { fileUrl, size };
}

// Update uploadAudio to return more data and handle DB insertion
export async function uploadAudioEnchanced(file: File, stopId: string, lang: string): Promise<{ fileUrl: string; size: number }> {
    const filePath = `${stopId}/${Date.now()}-${file.name}`;

    // Upload the file to Supabase
    const { error: uploadError, data: uploadData } = await supabase.storage.from("stops").upload(filePath, file);
    if (uploadError) throw new Error(`Error uploading file: ${uploadError.message}`);

    // Get public URL for the uploaded file
    const { data: urlData, error: urlError } = await supabase.storage.from("stops").getPublicUrl(filePath);
    if (urlError) throw new Error(`Error getting public URL: ${urlError.message}`);
    const fileUrl = urlData.publicUrl;

    // DB Insert
    const { error: dbError, data: dbData } = await supabase.from("stop_audios").insert([
        {
            stop_id: stopId,
            url: fileUrl,
            file_name: file.name,
            file_size: file.size
        },
    ]);
    if (dbError) throw new Error(`Error inserting audio record: ${dbError.message}`);

    return { fileUrl, size: file.size };
}

export async function uploadAudioSlogan(file: File, stopId: string, lang: string): Promise<{ fileUrl: string; size: number }> {
    const filePath = `${stopId}/${Date.now()}-${file.name}`;

    // Upload the file to Supabase
    const { error: uploadError, data: uploadData } = await supabase.storage.from("stops").upload(filePath, file);
    if (uploadError) throw new Error(`Error uploading file: ${uploadError.message}`);

    // Get public URL for the uploaded file
    const { data: urlData, error: urlError } = await supabase.storage.from("stops").getPublicUrl(filePath);
    if (urlError) throw new Error(`Error getting public URL: ${urlError.message}`);
    const fileUrl = urlData.publicUrl;

    return { fileUrl, size: file.size };
}

// Add a new function to orchestrate the audio generation, upload, and DB record creation
export async function handleStopAudioGeneration(stopName: string, stopId: string, lang: string = 'en-IN', speaker: string = 'abhilash') {
    try {
        // Generate TTS audio
        const base64Audio = await fetchTTS(stopName, lang, speaker);
        const audioBlob = base64ToBlob(base64Audio, "audio/wav");
        const audioFile = new File([audioBlob], `tts-${Date.now()}.wav`, { type: "audio/wav" });

        // Upload the audio file and get the URL
        const { fileUrl, size } = await uploadAudioEnchanced(audioFile, stopId, lang);

        console.log(`Audio generated and uploaded: ${fileUrl}`);
        return { fileUrl, size, fileName: audioFile.name };
    } catch (error) {
        console.error("Failed to generate and upload audio:", error);
        throw error;
    }
}

export async function handleSloganAudioGeneration(stopName: string, stopId: string, lang: string = 'en-IN', speaker: string = 'abhilash') {
    try {
        // Generate TTS audio
        const base64Audio = await fetchTTS(stopName, lang, speaker);
        const audioBlob = base64ToBlob(base64Audio, "audio/wav");
        const audioFile = new File([audioBlob], `tts-${Date.now()}.wav`, { type: "audio/wav" });

        // Upload the audio file and get the URL
        const { fileUrl, size } = await uploadAudioSlogan(audioFile, stopId, lang);

        console.log(`Audio generated and uploaded: ${fileUrl}`);
        return { fileUrl, size, fileName: audioFile.name };
    } catch (error) {
        console.error("Failed to generate and upload audio:", error);
        throw error;
    }
}