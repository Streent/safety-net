// src/app/(app)/escalas/data.ts

export interface TecnicoRaw {
  ID_Tecnico: string;
  Nome_Tecnico: string;
  Perfil_Tecnico: string;
  Especialidade_Tecnica: string;
  Residencia_Tecnico: string;
  Status_Original_Tecnico: 'Ativo' | 'Férias' | 'Licença';
}

export interface ViagemRaw {
  ID_Tecnico: string;
  Data_Viagem: string; // Format "YYYY-MM-DD"
  Cliente: string;
  Cidade_Cliente: string;
  Turno?: string;
}

export interface TecnicoProcessado extends TecnicoRaw {
  diasSemViajar: number | typeof Infinity;
  viagensNoAno: number;
  statusDisponibilidadeSistema: 'Disponível' | 'Indisponível';
  ultimaViagemDataFormatada?: string;
  pontuacao?: number;
}

export const mockTecnicosData: TecnicoRaw[] = [
  { ID_Tecnico: 'TEC001', Nome_Tecnico: 'Carlos Silva', Perfil_Tecnico: 'Sênior', Especialidade_Tecnica: 'Mecânica', Residencia_Tecnico: 'São Paulo, SP', Status_Original_Tecnico: 'Ativo' },
  { ID_Tecnico: 'TEC002', Nome_Tecnico: 'Ana Pereira', Perfil_Tecnico: 'Pleno', Especialidade_Tecnica: 'Elétrica', Residencia_Tecnico: 'Rio de Janeiro, RJ', Status_Original_Tecnico: 'Ativo' },
  { ID_Tecnico: 'TEC003', Nome_Tecnico: 'Roberto Alves', Perfil_Tecnico: 'Júnior', Especialidade_Tecnica: 'Automação', Residencia_Tecnico: 'Belo Horizonte, MG', Status_Original_Tecnico: 'Férias' },
  { ID_Tecnico: 'TEC004', Nome_Tecnico: 'Juliana Costa', Perfil_Tecnico: 'Sênior', Especialidade_Tecnica: 'Mecânica', Residencia_Tecnico: 'Curitiba, PR', Status_Original_Tecnico: 'Ativo' },
  { ID_Tecnico: 'TEC005', Nome_Tecnico: 'Fernanda Lima', Perfil_Tecnico: 'Pleno', Especialidade_Tecnica: 'Instrumentação', Residencia_Tecnico: 'Porto Alegre, RS', Status_Original_Tecnico: 'Licença' },
];

export const mockViagensData: ViagemRaw[] = [
  { ID_Tecnico: 'TEC001', Data_Viagem: '2025-05-20', Cliente: 'Cliente A', Cidade_Cliente: 'Campinas, SP', Turno: 'Integral' },
  { ID_Tecnico: 'TEC001', Data_Viagem: '2025-03-10', Cliente: 'Cliente B', Cidade_Cliente: 'Santos, SP' },
  { ID_Tecnico: 'TEC002', Data_Viagem: '2025-05-01', Cliente: 'Cliente C', Cidade_Cliente: 'Niterói, RJ', Turno: 'Manhã' },
  { ID_Tecnico: 'TEC004', Data_Viagem: '2025-04-15', Cliente: 'Cliente D', Cidade_Cliente: 'Londrina, PR' },
];
