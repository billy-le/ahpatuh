import { createFileRoute } from '@tanstack/react-router'
import { authClient } from '~/utils/auth-client'
export const Route = createFileRoute('/sign-up')({
  component: SignUp,
})

function SignUp() {
  const { signUp } = authClient;

  const handleSignUp: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target as HTMLFormElement)
    console.log(form);
    console.log(form.get('email'))
    await signUp.email({
      name: form.get('name'),
      email: form.get('email'),
      password: form.get('password'),
    }, {
      onRequest: (ctx) => {

      },
      onSuccess: (ctx) => {

      },
      onError: (ctx) => {
        alert(ctx.error.message)
      }
    })
  }

  return <div>
    <form onSubmit={handleSignUp}>
      <fieldset>
        <label htmlFor='name'>Name</label>
        <input id='name' name="name" type="text" required />
      </fieldset>
      <fieldset>
        <label htmlFor='email'>Email</label>
        <input id='email' name="email" type="email" required />
      </fieldset>
      <fieldset>
        <label htmlFor='password'>Password</label>
        <input id='password' name="password" type="password" required />
      </fieldset>
      <fieldset>
        <button type="submit">
          Sign Up
        </button>
      </fieldset>
    </form>
  </div>
}
