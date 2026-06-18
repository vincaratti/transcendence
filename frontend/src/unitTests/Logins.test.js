import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import Login from '@/components/Logins.vue'

describe('Login', () => {
  it('logs in when credentials are valid', async () => {
    vi.spyOn(window, 'prompt')
      .mockReturnValueOnce('alice')
      .mockReturnValueOnce('secret123')

    global.fetch = vi.fn().mockResolvedValue({
      ok: true
    })

    const wrapper = mount(Login)
    await wrapper.find('[data-testid="login-button"]').trigger('click')

    expect(window.prompt).toHaveBeenNthCalledWith(
      1,
      'Enter your username:'
    )

    expect(window.prompt).toHaveBeenNthCalledWith(
      2,
      'Enter your password:'
    )

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/login'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'alice',
          password: 'secret123'
        })
      })
    )

    window.prompt.mockRestore()
  })
  it('shows an alert when credentials are invalid', async () => {
    vi.spyOn(window, 'prompt')
      .mockReturnValueOnce('alice')
      .mockReturnValueOnce('wrongpassword')

    global.fetch = vi.fn().mockResolvedValue({
      ok: false
    })

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    const wrapper = mount(Login)

    await wrapper.find('[data-testid="login-button"]').trigger('click')

    expect(alertSpy).toHaveBeenCalledWith('Invalid credentials')
  })
})
describe('Signup', () => {
    it('signs up when username and email are available', async() => {
      vi.spyOn(window, 'prompt')
      .mockReturnValueOnce('sam')
      .mockReturnValueOnce('samuelBrugmans@gmail.com')
      .mockReturnValueOnce('password')

    const wrapper = mount(Login)
    await wrapper.find('[data-testid="signup-button"]').trigger('click')

    expect(window.prompt).toHaveBeenNthCalledWith(
      1,
      'Enter your username:'
    )
        expect(window.prompt).toHaveBeenNthCalledWith(
      2,
      'Enter your username:'
    )
    expect(window.prompt).toHaveBeenNthCalledWith(
      3,
      'Enter your password:'
    )

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/login'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'alice',
          password: 'secret123'
        })
      })
    )
    global.fetch = vi.fn().mockResolvedValue({
      ok: true
    })
    window.prompt.mockRestore()
  
})

})