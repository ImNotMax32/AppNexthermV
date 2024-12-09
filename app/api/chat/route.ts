import { NextResponse } from 'next/server';
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API Key');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = "asst_EkNBYkyD3lMRzHlJPXIt7rHm"; // Ton ID d'assistant

export async function POST(req: Request) {
  try {
    const { message, threadId } = await req.json() as { 
      message: string;
      threadId: string | null;
    };

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Créer ou réutiliser un thread
    let thread;
    if (threadId) {
      thread = await openai.beta.threads.retrieve(threadId);
    } else {
      thread = await openai.beta.threads.create();
    }

    // Ajouter le message au thread
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message
    });

    // Démarrer une exécution avec l'assistant
    const run = await openai.beta.threads.runs.create(
      thread.id,
      { assistant_id: ASSISTANT_ID }
    );

    // Attendre la réponse (avec timeout)
    const maxAttempts = 30;
    let attempts = 0;
    let runStatus;

    while (attempts < maxAttempts) {
      runStatus = await openai.beta.threads.runs.retrieve(
        thread.id,
        run.id
      );

      if (runStatus.status === 'completed') {
        break;
      } else if (runStatus.status === 'failed' || runStatus.status === 'expired') {
        throw new Error(`Run ended with status: ${runStatus.status}`);
      }

      attempts += 1;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde
    }

    // Récupérer les messages
    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data[0]; // Le dernier message est le premier dans la liste

    return NextResponse.json({ 
      response: lastMessage.content[0].text.value,
      threadId: thread.id // Renvoyer le threadId pour la continuité de la conversation
    });

  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}