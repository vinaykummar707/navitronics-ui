import { supabase } from "@/supabaseClient";

export function normalizeSarvamLanguageCode(lang?: string): string {
  if (!lang) return "en-IN";
  const l = lang.toLowerCase().trim();
  if (l === "en" || l === "english" || l === "en-in") return "en-IN";
  if (l === "hi" || l === "hindi" || l === "hi-in") return "hi-IN";
  if (l === "te" || l === "telugu" || l === "te-in") return "te-IN";
  if (l === "ta" || l === "tamil" || l === "ta-in") return "ta-IN";
  if (l === "kn" || l === "kannada" || l === "kn-in") return "kn-IN";
  if (l === "ml" || l === "malayalam" || l === "ml-in") return "ml-IN";
  if (l === "mr" || l === "marathi" || l === "mr-in") return "mr-IN";
  if (l === "gu" || l === "gujarati" || l === "gu-in") return "gu-IN";
  if (l === "bn" || l === "bengali" || l === "bn-in") return "bn-IN";
  if (l === "pa" || l === "punjabi" || l === "pa-in") return "pa-IN";
  if (l === "or" || l === "odia" || l === "or-in") return "or-IN";
  return lang.includes("-") ? lang : `${lang}-IN`;
}

export async function fetchTTS(
  text: string,
  lang: string = "en-IN",
  speaker: string = "meera"
): Promise<string> {
  const normalizedLang = normalizeSarvamLanguageCode(lang);
  const normalizedSpeaker = speaker || "meera";

  try {
    const response = await fetch("https://api.sarvam.ai/text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-subscription-key": "sk_ub6tmck1_GssLt4xToCdAjQGEgh3BJQKk",
      },
      body: JSON.stringify({
        inputs: [text],
        text: text,
        model: "bulbul:v2",
        speaker: normalizedSpeaker,
        target_language_code: normalizedLang,
        pace: 0.85,
        speech_sample_rate: 22050,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMsg =
        errorData?.message ||
        errorData?.detail ||
        `Sarvam TTS API returned status ${response.status}`;
      throw new Error(errorMsg);
    }

    const data = await response.json();
    const audioData = data.audios?.[0] || data.audio;
    if (!audioData) {
      throw new Error("No audio returned from TTS service");
    }
    return audioData;
  } catch (error: any) {
    console.error("fetchTTS Error:", error);
    throw error;
  }
}

export async function generateAudio(
  text: string,
  lang: string = "en-IN",
  speaker: string = "meera"
): Promise<File> {
  const base64Audio = await fetchTTS(text, lang, speaker);
  const audioBlob = base64ToBlob(base64Audio, "audio/wav");
  const fileName = `tts-${Date.now()}.wav`;
  const file = new File([audioBlob], fileName, { type: "audio/wav" });
  return file;
}

// Convert base64 → Blob
export function base64ToBlob(base64: string, mimeType: string = "audio/wav"): Blob {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

// Upload audio to Supabase
export async function uploadAudio(
  file: File,
  audio: any,
  category: string,
  stopInfo: string,
  lang: string
): Promise<{ fileUrl: string; size: number }> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `${stopInfo}/${lang}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("audios")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("audios").getPublicUrl(filePath);
  const fileUrl = data.publicUrl;
  return { fileUrl, size: file.size };
}

export async function uploadAudioEnchanced(
  file: File,
  stopId: string,
  lang: string
): Promise<{ fileUrl: string; size: number }> {
  const filePath = `${stopId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("stops")
    .upload(filePath, file);
  if (uploadError)
    throw new Error(`Error uploading file: ${uploadError.message}`);

  const { data: urlData } = supabase.storage
    .from("stops")
    .getPublicUrl(filePath);
  const fileUrl = urlData.publicUrl;

  const { error: dbError } = await supabase.from("stop_audios").insert([
    {
      stop_id: stopId,
      url: fileUrl,
      file_name: file.name,
      file_size: file.size,
    },
  ]);
  if (dbError)
    throw new Error(`Error inserting audio record: ${dbError.message}`);

  return { fileUrl, size: file.size };
}

export async function uploadAudioSlogan(
  file: File,
  stopId: string,
  lang: string
): Promise<{ fileUrl: string; size: number }> {
  const filePath = `${stopId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("stops")
    .upload(filePath, file);
  if (uploadError)
    throw new Error(`Error uploading file: ${uploadError.message}`);

  const { data: urlData } = supabase.storage
    .from("stops")
    .getPublicUrl(filePath);
  const fileUrl = urlData.publicUrl;

  return { fileUrl, size: file.size };
}

export async function handleStopAudioGeneration(
  stopName: string,
  stopId: string,
  lang: string = "en-IN",
  speaker: string = "meera"
) {
  try {
    const base64Audio = await fetchTTS(stopName, lang, speaker);
    const audioBlob = base64ToBlob(base64Audio, "audio/wav");
    const audioFile = new File([audioBlob], `tts-${Date.now()}.wav`, {
      type: "audio/wav",
    });

    const { fileUrl, size } = await uploadAudioEnchanced(
      audioFile,
      stopId,
      lang
    );

    return { fileUrl, size, fileName: audioFile.name };
  } catch (error) {
    console.error("Failed to generate and upload audio:", error);
    throw error;
  }
}

export async function handleSloganAudioGeneration(
  stopName: string,
  stopId: string,
  lang: string = "en-IN",
  speaker: string = "meera"
) {
  try {
    const base64Audio = await fetchTTS(stopName, lang, speaker);
    const audioBlob = base64ToBlob(base64Audio, "audio/wav");
    const audioFile = new File([audioBlob], `tts-${Date.now()}.wav`, {
      type: "audio/wav",
    });

    const { fileUrl, size } = await uploadAudioSlogan(
      audioFile,
      stopId,
      lang
    );

    return { fileUrl, size, fileName: audioFile.name };
  } catch (error) {
    console.error("Failed to generate and upload audio:", error);
    throw error;
  }
}