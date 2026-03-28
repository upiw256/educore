import { useRouter } from 'next/navigation';

export const useAuthProxy = () => {
  const router = useRouter();

  const loginProxy = async (credentials: { username: string; password: any }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        // Logika Proxy: Arahkan user sesuai Role dari Database
        switch (data.role) {
          case 'admin':
            router.push('/admin/dashboard');
            break;
          case 'piket':
            router.push('admin/piket/terlambat');
            break;
          case 'kesiswaan':
            router.push('admin/kesiswaan/pelanggaran');
            break;
          default:
            router.push('/dashboard');
        }
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Akses Ditolak' };
      }
    } catch (error) {
      return { success: false, message: 'Server EduCore tidak merespon' };
    }
  };

  return { loginProxy };
};