# Sistema de Onboarding - Deprocast

## Descripción

Este sistema implementa un flujo de onboarding obligatorio que se ejecuta cuando un usuario está logueado pero no ha completado el proceso de onboarding (`onboarding_completed = false`).

## Componentes Implementados

### 1. Hook `useOnboarding`
- **Archivo:** `src/hooks/useOnboarding.ts`
- **Funcionalidad:** 
  - Verifica el estado del onboarding del usuario
  - Maneja la lógica de completar el onboarding
  - Proporciona estados de loading y requerimiento de onboarding

### 2. Componente `OnboardingModal`
- **Archivo:** `src/components/OnboardingModal.tsx`
- **Funcionalidad:**
  - Modal que se muestra en el centro de la pantalla
  - En mobile ocupa toda la pantalla
  - Botón "Complete Onboarding" para finalizar el proceso

### 3. Integración en `App.tsx`
- **Funcionalidad:**
  - Verifica si el onboarding es requerido antes de mostrar la aplicación
  - Muestra el modal de onboarding si es necesario
  - Estado de loading mientras se verifica el estado del onboarding

## Flujo de Funcionamiento

1. **Usuario se loguea** → `useAuth` detecta la autenticación
2. **Verificación de onboarding** → `useOnboarding` verifica `onboarding_completed` en el perfil
3. **Si `onboarding_completed = false`** → Se muestra `OnboardingModal`
4. **Usuario completa onboarding** → Se actualiza la base de datos y se permite acceso a la app
5. **Si `onboarding_completed = true`** → Acceso directo a la aplicación

## Base de Datos

### Campo Requerido
- **Tabla:** `profiles`
- **Campo:** `onboarding_completed` (boolean, default: false)
- **SQL:** Ver archivo `supabase/015_add_onboarding_completed_field.sql`

## Uso

### Para Desarrolladores
```typescript
import { useOnboarding } from './hooks/useOnboarding';

const { isOnboardingRequired, isLoading, completeOnboarding } = useOnboarding();
```

### Para Usuarios
- El onboarding se ejecuta automáticamente después del login
- Es obligatorio completarlo para acceder a la plataforma
- Una vez completado, no se vuelve a mostrar

## Personalización Futura

El sistema está diseñado para ser fácilmente expandible:
- Agregar más slides al onboarding
- Modificar el contenido del modal
- Agregar validaciones adicionales
- Integrar con otros flujos de la aplicación

## Archivos de Base de Datos

Ejecutar en Supabase:
```sql
-- Archivo: 015_add_onboarding_completed_field.sql
-- Asegura que el campo onboarding_completed esté disponible
```

## Testing

Se incluye un componente de prueba:
- **Archivo:** `src/components/OnboardingTest.tsx`
- **Uso:** Para verificar el estado del onboarding durante el desarrollo
