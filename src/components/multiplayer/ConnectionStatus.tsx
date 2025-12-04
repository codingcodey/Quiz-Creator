interface ConnectionStatusProps {
  status?: {
    state: 'connected' | 'connecting' | 'disconnected' | 'error';
    errorMessage?: string;
  };
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  if (!status) return null;

  let icon: string;
  let color: string;
  let label: string;
  let bgColor: string;

  switch (status.state) {
    case 'connected':
      icon = '●';
      color = 'text-success';
      bgColor = 'bg-success/10';
      label = 'Connected';
      break;
    case 'connecting':
      icon = '◐';
      color = 'text-warning';
      bgColor = 'bg-warning/10';
      label = 'Connecting...';
      break;
    case 'disconnected':
      icon = '●';
      color = 'text-error';
      bgColor = 'bg-error/10';
      label = 'Disconnected';
      break;
    case 'error':
      icon = '●';
      color = 'text-error';
      bgColor = 'bg-error/10';
      label = 'Error';
      break;
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${bgColor}`}
      title={status.errorMessage || label}
    >
      <span className={`${color} text-lg animate-pulse`}>{icon}</span>
      <span className={`text-sm font-medium ${color}`}>{label}</span>
    </div>
  );
}
