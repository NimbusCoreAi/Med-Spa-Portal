import { SupabaseClient } from '@supabase/supabase-js';
import { getAnonSupabaseClient } from '../config';
import { Room } from '../types';

export interface CreateRoomParams {
  clinicId: string;
  name: string;
  capacity?: number;
}

export async function createRoom(params: CreateRoomParams, client?: SupabaseClient): Promise<Room> {
  const supabase = client ?? getAnonSupabaseClient();

  const { data, error } = await supabase
    .from('rooms')
    .insert({
      clinic_id: params.clinicId,
      name: params.name,
      capacity: params.capacity
    })
    .select()
    .single();

  if (error) throw new Error(`Create room failed: ${error.message}`);
  return data as Room;
}

export async function getRooms(clinicId: string, client?: SupabaseClient): Promise<Room[]> {
  const supabase = client ?? getAnonSupabaseClient();

  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('name', { ascending: true });

  if (error) throw new Error(`Fetch rooms failed: ${error.message}`);
  return (data ?? []) as Room[];
}
