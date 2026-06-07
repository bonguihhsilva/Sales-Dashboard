'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2, ChevronRight, BookOpen, Video, FileText, PlayCircle, Settings, Layers, AlignLeft } from 'lucide-react'
import { toast } from 'sonner'
import {
  createTrilhaAction, updateTrilhaAction, deleteTrilhaAction,
  createModuloAction, updateModuloAction, deleteModuloAction,
  createAulaAction, updateAulaAction, deleteAulaAction,
  createQuizAction, deleteQuizAction,
  createProvaAction, deleteProvaAction,
  createQuestaoProvaAction, deleteQuestaoProvaAction
} from './actions'

// Modals
type ModalState = { isOpen: boolean; type: string; payload?: any }

export default function AdminLmsClient({
  initialTrilhas,
  initialModulos,
  initialAulas,
  initialQuizzes,
  initialProvas,
  initialQuestoesProva
}: {
  initialTrilhas: any[]
  initialModulos: any[]
  initialAulas: any[]
  initialQuizzes: any[]
  initialProvas: any[]
  initialQuestoesProva: any[]
}) {
  const [activeTrilha, setActiveTrilha] = useState<any | null>(null)
  const [activeModulo, setActiveModulo] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState<ModalState>({ isOpen: false, type: '' })

  const handleAction = async (actionFn: () => Promise<any>, successCallback?: () => void) => {
    setLoading(true)
    try {
      const res = await actionFn()
      if (res && res.error) throw new Error(res.error)
      if (successCallback) successCallback()
    } catch (e: any) {
      toast.error('Erro', { description: e.message || 'Ocorreu um erro' })
    }
    setLoading(false)
    setModal({ isOpen: false, type: '' })
  }

  // Styles
  const btnPrimary = "inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md shadow hover:bg-primary/90 transition-colors"
  const btnGhost = "inline-flex items-center justify-center gap-2 px-4 py-2 hover:bg-surface-variant text-foreground font-medium rounded-md transition-colors"
  const btnDangerGhost = "inline-flex items-center justify-center p-2 hover:bg-error/20 text-error rounded-md transition-colors"
  const inputClass = "w-full bg-surface-variant border border-outline/30 rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"

  // Renderers
  const renderTrilhasSidebar = () => (
    <div className="w-80 flex-shrink-0 bg-surface-container-lowest border-r border-border min-h-[calc(100vh-80px)] p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-title-md font-bold text-foreground">Trilhas</h2>
        <button className="p-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20" onClick={() => setModal({ isOpen: true, type: 'createTrilha' })}>
          <Plus size={18} />
        </button>
      </div>
      
      <div className="flex flex-col gap-2 mt-4">
        {initialTrilhas.map(t => (
          <button 
            key={t.id} 
            onClick={() => { setActiveTrilha(t); setActiveModulo(null) }}
            className={`flex items-start flex-col gap-1 p-4 rounded-xl border transition-all text-left ${activeTrilha?.id === t.id ? 'bg-primary/10 border-primary' : 'bg-surface border-border hover:border-outline/50'}`}
          >
            <span className="font-semibold text-foreground">{t.titulo}</span>
            <span className="text-xs text-on-surface-variant flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${t.ativa ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
              {t.ativa ? 'Ativa' : 'Inativa'}
            </span>
          </button>
        ))}
        {initialTrilhas.length === 0 && (
          <div className="text-sm text-on-surface-variant text-center p-4">Nenhuma trilha criada.</div>
        )}
      </div>
    </div>
  )

  const renderContent = () => {
    if (!activeTrilha) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant">
          <BookOpen size={48} className="opacity-20 mb-4" />
          <h3 className="text-lg font-medium">Selecione uma Trilha</h3>
          <p className="text-sm mt-1">Ou crie uma nova no menu lateral para começar.</p>
        </div>
      )
    }

    const modulosDaTrilha = initialModulos.filter(m => m.trilha_id === activeTrilha.id)

    return (
      <div className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
          <div>
            <h1 className="text-display-lg text-foreground font-bold mb-2">{activeTrilha.titulo}</h1>
            <p className="text-on-surface-variant">{activeTrilha.descricao || 'Sem descrição'}</p>
          </div>
          <div className="flex gap-2">
            <button className={btnDangerGhost} onClick={() => {
              if (confirm('Tem certeza? Isso excluirá todos os módulos e aulas desta trilha!')) {
                handleAction(() => deleteTrilhaAction(activeTrilha.id), () => setActiveTrilha(null))
              }
            }}><Trash2 size={18} /></button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-title-md font-semibold text-foreground flex items-center gap-2">
            <Layers size={20} className="text-primary" /> Módulos
          </h2>
          <button className={btnPrimary} onClick={() => setModal({ isOpen: true, type: 'createModulo', payload: { trilha_id: activeTrilha.id } })}>
            <Plus size={16} /> Novo Módulo
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {modulosDaTrilha.map(m => {
            const isExpanded = activeModulo === m.id
            const aulas = initialAulas.filter(a => a.modulo_id === m.id)
            const prova = initialProvas.find(p => p.modulo_id === m.id)

            return (
              <div key={m.id} className="bg-surface border border-border rounded-xl overflow-hidden transition-all shadow-sm">
                <div 
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-surface-variant/50 transition-colors"
                  onClick={() => setActiveModulo(isExpanded ? null : m.id)}
                >
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{m.titulo}</h3>
                    <p className="text-sm text-on-surface-variant">{aulas.length} Aulas {prova ? '• Possui Prova Final' : ''}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className={btnDangerGhost} onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Excluir módulo?')) handleAction(() => deleteModuloAction(m.id))
                    }}><Trash2 size={16} /></button>
                    <ChevronRight size={20} className={`text-outline transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 border-t border-border bg-surface-container-lowest/50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider text-on-surface-variant">Aulas</h4>
                      <button className="text-xs text-primary font-medium hover:underline flex items-center gap-1" onClick={() => setModal({ isOpen: true, type: 'createAula', payload: { modulo_id: m.id } })}>
                        <Plus size={14} /> Adicionar Aula
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 mb-6">
                      {aulas.map(a => {
                        const icon = a.tipo_conteudo === 'video' ? <Video size={16}/> : a.tipo_conteudo === 'pdf' ? <FileText size={16}/> : <AlignLeft size={16}/>
                        const quizzes = initialQuizzes.filter(q => q.aula_id === a.id)
                        
                        return (
                          <div key={a.id} className="p-4 bg-surface border border-border rounded-lg flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 text-primary rounded-md">{icon}</div>
                                <div>
                                  <div className="font-medium text-foreground text-sm">{a.titulo}</div>
                                  <div className="text-xs text-on-surface-variant">{a.tipo_conteudo.toUpperCase()} {a.is_global && '• Global'}</div>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button className="text-xs text-primary font-medium hover:underline px-2" onClick={() => setModal({ isOpen: true, type: 'createQuiz', payload: { aula_id: a.id } })}>+ Quiz</button>
                                <button className="text-error hover:bg-error/10 p-1 rounded transition-colors" onClick={() => {
                                  if(confirm('Excluir aula?')) handleAction(() => deleteAulaAction(a.id))
                                }}><Trash2 size={14} /></button>
                              </div>
                            </div>
                            
                            {/* Lista de Quizzes da Aula */}
                            {quizzes.length > 0 && (
                              <div className="pl-12 flex flex-col gap-2">
                                {quizzes.map(q => (
                                  <div key={q.id} className="text-xs bg-surface-variant/50 p-2 rounded border border-border flex justify-between items-center">
                                    <span className="text-on-surface-variant truncate mr-4">Q: {q.pergunta}</span>
                                    <button className="text-error hover:text-error/80" onClick={() => handleAction(() => deleteQuizAction(q.id))}><Trash2 size={12}/></button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                      {aulas.length === 0 && <div className="text-xs text-on-surface-variant italic py-2">Nenhuma aula neste módulo.</div>}
                    </div>

                    <div className="border-t border-border pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-foreground text-sm uppercase tracking-wider text-on-surface-variant">Prova Final do Módulo</h4>
                        {!prova && (
                          <button className="text-xs text-primary font-medium hover:underline flex items-center gap-1" onClick={() => setModal({ isOpen: true, type: 'createProva', payload: { modulo_id: m.id } })}>
                            <Plus size={14} /> Adicionar Prova
                          </button>
                        )}
                      </div>

                      {prova ? (
                        <div className="p-4 border border-secondary/30 bg-secondary/5 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="font-semibold text-secondary-fixed-dim">{prova.titulo}</div>
                              <div className="text-xs text-on-surface-variant">Nota Mínima: {prova.nota_minima}%</div>
                            </div>
                            <div className="flex gap-2">
                              <button className="text-xs text-secondary-fixed-dim hover:underline" onClick={() => setModal({ isOpen: true, type: 'createQuestaoProva', payload: { prova_id: prova.id } })}>+ Questão</button>
                              <button className="text-error hover:bg-error/10 p-1 rounded" onClick={() => {
                                if(confirm('Excluir prova?')) handleAction(() => deleteProvaAction(prova.id))
                              }}><Trash2 size={14} /></button>
                            </div>
                          </div>

                          {/* Questoes da Prova */}
                          <div className="flex flex-col gap-2">
                            {initialQuestoesProva.filter(qp => qp.prova_id === prova.id).map(qp => (
                              <div key={qp.id} className="text-xs bg-surface p-2 rounded border border-border flex justify-between items-center">
                                <span className="text-foreground truncate mr-4">{qp.pergunta}</span>
                                <button className="text-error hover:text-error/80" onClick={() => handleAction(() => deleteQuestaoProvaAction(qp.id))}><Trash2 size={12}/></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-on-surface-variant italic">Módulo sem prova final.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Generic Modal component
  const renderModal = () => {
    if (!modal.isOpen) return null

    const close = () => setModal({ isOpen: false, type: '' })
    
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
          
          {modal.type === 'createTrilha' && (
            <form onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              handleAction(() => createTrilhaAction({
                titulo: fd.get('titulo') as string,
                descricao: fd.get('descricao') as string,
                ativa: fd.get('ativa') === 'true'
              }))
            }}>
              <h3 className="text-title-md font-bold mb-4">Nova Trilha</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Título</label>
                  <input name="titulo" required className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Descrição</label>
                  <textarea name="descricao" rows={3} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Status</label>
                  <select name="ativa" className={inputClass}>
                    <option value="true">Ativa</option>
                    <option value="false">Inativa</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={close} className={btnGhost}>Cancelar</button>
                <button type="submit" disabled={loading} className={btnPrimary}>{loading ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          )}

          {modal.type === 'createModulo' && (
            <form onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              handleAction(() => createModuloAction({
                trilha_id: modal.payload.trilha_id,
                titulo: fd.get('titulo') as string,
                descricao: fd.get('descricao') as string,
                ordem: parseInt(fd.get('ordem') as string) || 0
              }))
            }}>
              <h3 className="text-title-md font-bold mb-4">Novo Módulo</h3>
              <div className="space-y-4">
                <div><label className="block text-xs font-medium mb-1">Título</label><input name="titulo" required className={inputClass} /></div>
                <div><label className="block text-xs font-medium mb-1">Descrição</label><textarea name="descricao" rows={2} className={inputClass} /></div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={close} className={btnGhost}>Cancelar</button>
                <button type="submit" disabled={loading} className={btnPrimary}>Salvar</button>
              </div>
            </form>
          )}

          {modal.type === 'createAula' && (
            <form onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              handleAction(() => createAulaAction({
                modulo_id: modal.payload.modulo_id,
                titulo: fd.get('titulo') as string,
                tipo_conteudo: fd.get('tipo_conteudo') as string,
                url_midia: fd.get('url_midia') as string,
                conteudo_texto: fd.get('conteudo_texto') as string,
                ordem: 0
              }))
            }}>
              <h3 className="text-title-md font-bold mb-4">Nova Aula</h3>
              <div className="space-y-4">
                <div><label className="block text-xs font-medium mb-1">Título</label><input name="titulo" required className={inputClass} /></div>
                <div>
                  <label className="block text-xs font-medium mb-1">Tipo de Conteúdo</label>
                  <select name="tipo_conteudo" className={inputClass}>
                    <option value="video">Vídeo</option>
                    <option value="pdf">PDF</option>
                    <option value="slide">Slide</option>
                    <option value="texto">Texto Rico</option>
                  </select>
                </div>
                <div><label className="block text-xs font-medium mb-1">URL (Mídia/Vídeo)</label><input name="url_midia" placeholder="https://" className={inputClass} /></div>
                <div><label className="block text-xs font-medium mb-1">Conteúdo Extra (Texto)</label><textarea name="conteudo_texto" rows={3} className={inputClass} /></div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={close} className={btnGhost}>Cancelar</button>
                <button type="submit" disabled={loading} className={btnPrimary}>Salvar</button>
              </div>
            </form>
          )}

          {/* Quizzes e Provas (Formulários Simplificados) */}
          {(modal.type === 'createQuiz' || modal.type === 'createQuestaoProva') && (
            <form onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              const opcoes = [fd.get('opt0') as string, fd.get('opt1') as string, fd.get('opt2') as string, fd.get('opt3') as string]
              const payload = {
                pergunta: fd.get('pergunta') as string,
                opcoes,
                indice_correta: parseInt(fd.get('indice_correta') as string)
              }
              if (modal.type === 'createQuiz') {
                handleAction(() => createQuizAction({ ...payload, aula_id: modal.payload.aula_id }))
              } else {
                handleAction(() => createQuestaoProvaAction({ ...payload, prova_id: modal.payload.prova_id }))
              }
            }}>
              <h3 className="text-title-md font-bold mb-4">Nova Questão</h3>
              <div className="space-y-3">
                <div><label className="block text-xs font-medium mb-1">Pergunta</label><textarea name="pergunta" required rows={2} className={inputClass} /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="block text-xs mb-1">Opção 0</label><input name="opt0" required className={inputClass} /></div>
                  <div><label className="block text-xs mb-1">Opção 1</label><input name="opt1" required className={inputClass} /></div>
                  <div><label className="block text-xs mb-1">Opção 2</label><input name="opt2" required className={inputClass} /></div>
                  <div><label className="block text-xs mb-1">Opção 3</label><input name="opt3" required className={inputClass} /></div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Índice da Correta (0 a 3)</label>
                  <select name="indice_correta" className={inputClass}>
                    <option value="0">Opção 0</option>
                    <option value="1">Opção 1</option>
                    <option value="2">Opção 2</option>
                    <option value="3">Opção 3</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={close} className={btnGhost}>Cancelar</button>
                <button type="submit" disabled={loading} className={btnPrimary}>Salvar</button>
              </div>
            </form>
          )}

          {modal.type === 'createProva' && (
            <form onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              handleAction(() => createProvaAction({
                modulo_id: modal.payload.modulo_id,
                titulo: fd.get('titulo') as string,
                nota_minima: parseInt(fd.get('nota_minima') as string) || 70
              }))
            }}>
              <h3 className="text-title-md font-bold mb-4">Nova Prova Final</h3>
              <div className="space-y-4">
                <div><label className="block text-xs font-medium mb-1">Título</label><input name="titulo" defaultValue="Prova Final" required className={inputClass} /></div>
                <div><label className="block text-xs font-medium mb-1">Nota Mínima (%)</label><input type="number" name="nota_minima" defaultValue={70} required className={inputClass} /></div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={close} className={btnGhost}>Cancelar</button>
                <button type="submit" disabled={loading} className={btnPrimary}>Salvar</button>
              </div>
            </form>
          )}

        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-64px)] w-full relative">
      {renderTrilhasSidebar()}
      {renderContent()}
      {renderModal()}
    </div>
  )
}
