'use client'

import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { createItemObjeto, fetchNegotiationObjetoById, ICadastroItensObjeto, setItensObjetoAtual, updateItemObjeto } from "@/hooks/slices/trade/tradeNegotiationsSlice";
import { AppDispatch, RootState } from "@/hooks/store";
import { Button, Input, message} from "antd";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default (() => {

    const params = useParams()
    const [id, setId] = useState(params.idItem)
    
    const { user } = useSelector((state: RootState) => state.auth);

    const dispatch = useDispatch<AppDispatch>()

    const { itensObjeto = [], loading } = useSelector((state: RootState) => state.tradeNegotiations);
    const itensObjetoArray = Array.isArray(itensObjeto) ? itensObjeto : [];
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    //Variáveis
    const [itemDescricao, setItemDescricao] = useState('')
    const [itemSigla, setItemSigla] = useState('')
    const [dataItem, setDataItem] = useState<any> ()

    const toggleNewItemInput = () => {
        //setShowNewItemInput(!showNewItemInput);
        //setSelectedItem(null);
        setItemDescricao('')
        setItemSigla('');
        setId('')
    };

    useEffect(() =>{
        if(id){
            carregarDadosEdicao(Number(id))
        }
    }, [id])

    function carregarDadosEdicao(id:number){
        dispatch(fetchNegotiationObjetoById(id)).then((data) =>{
            setItemDescricao(data.payload.descricao)
            setItemSigla(data.payload.sigla)
        })
    }

    function handleUpdateItem(){
        const dataItem:ICadastroItensObjeto = {
            descricao: itemDescricao,
            sigla: itemSigla,
            usuario: user.username
        }
        dispatch(updateItemObjeto({id: Number(id), data: dataItem})).unwrap().then((response) =>{
            message.success('Item Atualizado com sucesso!');
            console.log(response)
            setTimeout(() => {
                window.location.href = '/tradeObjetos/list';
            }, 1000)
        }).catch((error) =>{
            console.log(error)
        })
    }

    function handleAddItem() {
        const itemData = {
            descricao: itemDescricao,
            sigla: itemSigla,
            usuario: user?.username || 'Usuário'
        }

        dispatch(createItemObjeto(itemData)).unwrap().then((item) => {
            message.success('Item adicionado com sucesso!');
            setItemDescricao('');
            setItemSigla('');

            setTimeout(() => {
                window.location.href = '/tradeObjetos/list';
            }, 1000);

        })
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} />
            <main className="pt-16 transition-all duration-300 ml-20">
                <div className="p-4">
                    <div className="max-w-3xl mx-auto space-y-4">
                        <div className="bg-white p-4 rounded shadow">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-green-600">
                                    Itens da Campanha
                                </h2>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Descrição do Item"
                                        value={itemDescricao}
                                        onChange={(e) =>
                                            setItemDescricao(
                                                e.target.value
                                            )
                                        }
                                        className="flex-1"
                                    />
                                    <Input
                                        placeholder="Sigla"
                                        value={itemSigla}
                                        onChange={(e) =>
                                            setItemSigla(e.target.value)
                                        }
                                        className="w-24"
                                    />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button
                                        onClick={toggleNewItemInput}
                                        className="bg-gray-200 hover:bg-gray-300"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={id? handleUpdateItem : handleAddItem}
                                        className="bg-green-500 hover:bg-green-600"
                                        disabled={
                                            !itemDescricao || !itemSigla
                                        }
                                    >
                                        {id? (
                                            "Atualizar Item"
                                        ):(
                                            "Salvar Item"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
})