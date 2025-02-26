import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createRouteHandlerClient<any>({ 
    cookies: () => cookies()
  });
  
  try {   
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { data, error } = await supabase
      .from('dimensionnements')  // Correction du nom de la table
      .select(`
        id,
        project_name,
        parameters,
        created_at,
        updated_at
      `)
      .eq('user_id', session.user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const transformedData = data.map(item => ({
      id: item.id,
      projectName: item.project_name,
      createdAt: item.created_at,
      parameters: item.parameters
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('[GET_DIMENSIONNEMENTS]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient<any>({ 
    cookies: () => cookies()
  });
  
  try {   
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    console.log('Données reçues:', body);

    const { data, error } = await supabase
      .from('dimensionnements')  // Correction du nom de la table
      .insert({
        user_id: session.user.id,
        project_name: body.projectName,
        parameters: body.parameters,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur Supabase:', error);
      throw error;
    }

    return NextResponse.json({
      id: data.id,
      projectName: data.project_name,
      createdAt: data.created_at,
      parameters: data.parameters
    });
  } catch (error) {
    console.error('[SAVE_DIMENSIONNEMENT]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const supabase = createRouteHandlerClient<any>({ 
    cookies: () => cookies()
  });
  
  try {   
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) return new NextResponse('ID required', { status: 400 });

    const { data: existing } = await supabase
      .from('dimensionnements')  // Correction du nom de la table
      .select()
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (!existing) return new NextResponse('Dimensionnement not found', { status: 404 });

    const { data, error } = await supabase
      .from('dimensionnements')  // Correction du nom de la table
      .update({ 
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({
      id: data.id,
      projectName: data.project_name,
      createdAt: data.created_at,
      parameters: data.parameters
    });
  } catch (error) {
    console.error('[DELETE_DIMENSIONNEMENT]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}