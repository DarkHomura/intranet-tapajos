import React, { useEffect, useState } from 'react';
import { Table as AntdTable, Input, DatePicker, Button, Space, Form, message, Modal } from 'antd';
import { Eye, Edit, Trash2, Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteItemObjeto, fetchItensObjeto, fetchNegotiationObjetoById, ICadastroItensObjeto } from '@/hooks/slices/trade/tradeNegotiationsSlice';
import { AppDispatch, RootState } from '@/hooks/store';
import { FloatingActionButton } from '../nopaper/floating-action-button';
import { useParams, useRouter } from 'next/navigation';

export default (() => {

    const { itensObjeto = [], loading } = useSelector((state: RootState) => state.tradeNegotiations);
    const itensObjetoArray = Array.isArray(itensObjeto) ? itensObjeto : [];
    const [vetor, setVetor] = useState<any>()
    const [objectsFiltered, setObjectsFiltered] = useState<any[]>([]);
    const [searchForm] = Form.useForm();
    const router = useRouter();

    const params = useParams()
    const id = params.idItem

    const dispatch = useDispatch<AppDispatch>()

    useEffect(() => {
        dispatch(fetchItensObjeto())
    }, [dispatch, id])

    function handleSearch(values:any) {
        if (!values.descricao) {
            dispatch(fetchItensObjeto());
            return;
        }
        const searchParams: any = {}

        if(values.descricao){
            searchParams.descricao = values.descricao
        }

        let resultadosFiltrados = [...itensObjetoArray]
        const termoBusca = searchParams.descricao.toLowerCase()
        resultadosFiltrados = itensObjetoArray.filter((item) => 
            item.descricao && item.descricao.toLowerCase().includes(termoBusca)
        )

        console.log(resultadosFiltrados)

        updateSearch(resultadosFiltrados)
    }

    const updateSearch = (results:any[]) =>{
        if(results.length === 0){
            message.info('Nenhum item encontrado')
        }
        setObjectsFiltered(results)
    }

    const handleReset = () => {
        searchForm.resetFields()
        setObjectsFiltered([])
        dispatch(fetchItensObjeto())
    }

    function handleViewObject(id: any) {
        dispatch(fetchNegotiationObjetoById(id)).then((data) =>{
            console.log(data.payload)

            Modal.info({
                title: 'Detalhes do Objeto',
                content:(
                    <div>
                        <div className='mb-4'>
                            <p>
                                <strong>Descrição:</strong>
                                {' '}{data.payload?.descricao}
                            </p>
                            <p>
                                <strong>SILGLA: </strong>
                                {data.payload?.sigla}
                            </p>
                            <p>
                                <strong>Criado/Alerado por: </strong>
                                {data.payload?.usuario}
                            </p>
                        </div>
                    </div>
                ), 
                okButtonProps: {
                    style: {
                        backgroundColor: '#4CAF50',
                        borderColor: '#4CAF50',
                    },
                },
                width: 800
            })
        })
    }

    function handleDeleteItem(id:any){
         //const itemObjeto = itensObjetoArray?.find((item:ICadastroItensObjeto) => item.id == id)

        Modal.confirm({
            title: "Você tem certexa que deseja deletar este objeto?",
            content: 'Esta ação não pode ser desfeita.',
            okText: 'Sim',
            okType: 'danger',
            cancelText: 'Não',
            onOk(){
                dispatch(deleteItemObjeto(id)).then(() =>{
                     message.success('Objeto deletado com sucesso!');
                    dispatch(fetchItensObjeto());
                })
            },
             onCancel() {
                console.log('Cancelado');
            },
        })
    }

    function handleEditItem(id:any){
       router.push(`/tradeObjetos/edit/${id}`)
    }

     const sortedObjects = Array.isArray(
        objectsFiltered.length > 0 ? objectsFiltered : itensObjetoArray
    )
        ? [
              ...(objectsFiltered.length > 0 ? objectsFiltered : itensObjetoArray),
          ].sort((a, b) => {
              if (!a?.id || !b?.id) return 0;
              return b.id - a.id;
          })
        : [];

    const columns = [
        {
            title: 'Descrição',
            dataIndex: 'descricao',
            key: 'descricao',
            sorter: (a: ICadastroItensObjeto, b: ICadastroItensObjeto) =>
                (a.descricao || '').localeCompare(b.descricao || ''),
        },
        {
            title: 'Usuário',
            dataIndex: 'usuario',
            key: 'usuario',
        },
        {
            title: 'sigla',
            dataIndex: 'sigla',
            key: 'sigla',
            sorter: (a: ICadastroItensObjeto, b: ICadastroItensObjeto) =>
                (a.sigla || '').localeCompare(b.sigla || ''),
        },
        {
            title: 'Ações',
            key: 'acoes',
            render: (record: ICadastroItensObjeto) => (
                <div className="flex items-center space-x-2">
                    <Eye
                        color="#11833b"
                        onClick={() => handleViewObject(record.id || 0)}
                        className="cursor-pointer hover:scale-110 transition-transform"
                        size={18}
                    />
                    <Edit
                        color="#11833b"
                        onClick={() => handleEditItem(record.id || 0)}
                        className="cursor-pointer hover:scale-110 transition-transform"
                        size={18}
                    />

                    <Trash2
                        color="#ff4d4f"
                        onClick={() => handleDeleteItem(record.id || 0)}
                        className="cursor-pointer hover:scale-110 transition-transform"
                        size={18}
                    />
                </div>
            ),
        },
    ];


    return (
        <div className='space-y-4'>
            <Form
                form={searchForm}
                layout="inline"
                onFinish={handleSearch}
                className="mb-4 p-4 bg-white rounded-md shadow-sm"
            >
                <Form.Item name="descricao" className="mb-2 md:mb-0">
                    <Input
                        placeholder="Nome do objeto"
                        allowClear
                        onChange={() => {
                            if (objectsFiltered.length > 0) {
                                // Limpar filtros se o campo for esvaziado
                                if (!searchForm.getFieldValue('descricao')) {
                                    handleReset();
                                }
                            }
                        }}
                        
                    />
                </Form.Item>

                <Form.Item className="mb-2 md:mb-0">
                    <Space>
                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{
                                backgroundColor: '#11833b',
                                borderColor: '#11833b',
                            }}
                            icon={<Search size={16} />}
                        >
                            Buscar
                        </Button>
                        <Button
                            onClick={handleReset}
                            type={
                                objectsFiltered.length > 0
                                    ? 'primary'
                                    : 'default'
                            }
                            danger={objectsFiltered.length > 0}
                        >
                            Limpar busca
                        </Button>
                    </Space>
                </Form.Item>
            </Form>

            <div className="rounded-md border">
                <AntdTable
                    columns={columns}
                    dataSource={sortedObjects}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Total de ${total} registros`,
                    }}
                    locale={{
                        emptyText: 'Nenhuma negociação encontrada',
                    }}
                />
                <FloatingActionButton href="/tradeNegotiations" />
            </div>

        </div>
    )
})