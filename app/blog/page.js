'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'

const categories = ['Tümü', 'CV Yazma İpuçları', 'Mülakat Hazırlık', 'Kariyer Tavsiyeleri', 'Sektörel Haberler']

export default function BlogPage() {
  const [posts, setPosts] = useState([])
  const [activeCategory, setActiveCategory] = useState('Tümü')
  const [user, setUser] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', category: 'CV Yazma İpuçları' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
    if (data) setPosts(data)
  }

  const handleSubmit = async () => {
    if (!form.title || !form.content) return
    setSubmitting(true)
    const { error } = await supabase.from('blog_posts').insert({
      user_id: user.id,
      title: form.title,
      content: form.content,
      category: form.category,
      author_name: user.email,
      status: 'pending'
    })
    if (!error) {
      setSubmitted(true)
      setShowForm(false)
      setForm({ title: '', content: '', category: 'CV Yazma İpuçları' })
    }
    setSubmitting(false)
  }

  const filteredPosts = activeCategory === 'Tümü' ? posts : posts.filter(p => p.category === activeCategory)

  return (
    <div className="min-h-screen bg-gray-950 pt-20">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Başlık */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-4xl font-bold mb-2">Kariyer Blog</h1>
            <p className="text-gray-400">CV, mülakat ve kariyer hakkında ipuçları</p>
          </div>
          {user && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2.5 rounded-xl transition-all"
            >
              ✍️ Blog Yaz
            </button>
          )}
        </div>

        {/* Başvuru başarılı mesajı */}
        {submitted && (
          <div className="bg-green-900 bg-opacity-30 border border-green-700 rounded-2xl px-5 py-4 mb-6">
            <p className="text-green-400 text-sm">✅ Blog yazınız admin onayına gönderildi! Onaylandıktan sonra yayınlanacak.</p>
          </div>
        )}

        {/* Blog Yazma Formu */}
        {showForm && user && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
            <h3 className="text-white font-bold text-lg mb-4">Yeni Blog Yazısı</h3>
            <input
              type="text"
              placeholder="Başlık"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 mb-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {categories.filter(c => c !== 'Tümü').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <textarea
              placeholder="Blog içeriğinizi yazın..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-blue-500 text-sm h-48 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={submitting || !form.title || !form.content}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-6 py-2.5 rounded-xl transition-all"
              >
                {submitting ? 'Gönderiliyor...' : '📤 Onaya Gönder'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-800 hover:bg-gray-700 text-white text-sm px-6 py-2.5 rounded-xl transition-all"
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {/* Giriş yapmamış kullanıcıya mesaj */}
        {!user && (
          <div className="bg-blue-900 bg-opacity-20 border border-blue-800 rounded-2xl px-5 py-4 mb-6">
            <p className="text-blue-400 text-sm">
              Blog yazmak için{' '}
              <button onClick={() => router.push('/login')} className="underline hover:text-blue-300">giriş yapın</button>
            </p>
          </div>
        )}

        {/* Kategori Filtreleri */}
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Blog Yazıları */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📝</p>
            <p className="text-gray-400 text-lg">Henüz bu kategoride yazı yok</p>
            <p className="text-gray-500 text-sm mt-2">İlk yazan sen ol!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPosts.map((post) => (
              <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-blue-500 transition-all">
                <span className="text-xs bg-blue-600 bg-opacity-20 text-blue-400 px-2 py-1 rounded-full border border-blue-600 border-opacity-30">
                  {post.category}
                </span>
                <h3 className="text-white font-bold text-lg mt-3 mb-2">{post.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{post.content}</p>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-gray-500 text-xs">{post.author_name}</p>
                  <p className="text-gray-500 text-xs">{new Date(post.created_at).toLocaleDateString('tr-TR')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}