import React, { useState, useEffect } from 'react'
import "./index.css"
import api from './services/api'
import Moment from 'moment'
import utils from './utils/utils'

export default function App(props) {

    Moment.locale('pt')

    const responseFields = {
        isError: false,
        text: '',
        modalResponse: true
    }
    const fileFields = {
        hash_invoice: '',
        nameFile: '',
        typeFile: '',
        extension: ''
    }
    const [response, setResponse] = useState(responseFields)
    const [isLoader, setIsLoader] = useState(false)
    const [file, setFile] = useState(fileFields)
    const [data, setData] = useState([])
    const [balance, setBalance] = useState([])

    const [cssButton, setCssButton] = useState('not-allowed')

    const getTransactions = async () => {
        setData([])
        setIsLoader(true)
        setResponse(responseFields)

        try {
            const res = await api.get(`/transactions`)

            if (res.data) {
                setData(res.data)
            }

        } catch (error) {
            setResponse({
                isError: true,
                text: 'Error ao executar esta operação...' + error.response,
                modalResponse: true
            })
        } finally {
            setIsLoader(false)
            getBalance()
        }
    }

    const getBalance = async () => {
        setBalance([])
        setIsLoader(true)
        setResponse(responseFields)

        try {
            const res = await api.get(`/balance`)
            if (res.data) {
                console.log(res.data)
                setBalance(res.data)
            }

        } catch (error) {
            setResponse({
                isError: true,
                text: 'Error ao executar esta operação...' + error.response,
                modalResponse: true
            })
        } finally {
            setIsLoader(false)
        }
    }

    const convertBase64 = async (file) => {

        return new Promise((resolve, reject) => {
            const fileReader = new FileReader()
            fileReader.readAsDataURL(file)
            fileReader.onload = () => {
                resolve(fileReader.result)
            }
            fileReader.onerror = (error) => {
                reject(error)
            }
        })
    }

    const upload = async (e) => {

        setResponse(responseFields)
        setFile(fileFields)
        setCssButton('not-allowed')

        if (e.target.files[0]) {
            const file = e.target.files[0]
            const amountFile = file.size
            const typeFile = file.type
            const [extension, ...nameParts] = file.name.split('.').reverse()
            const base64 = await convertBase64(file)

            if (amountFile > 1024 * 1024 * 5) {
                setResponse({
                    isError: true,
                    text: 'O Arquivo deve ter no máximo 5MB',
                    modalError: true
                })
                return
            }

            setFile({
                hash_invoice: base64,
                nameFile: nameParts[0] + '.' + extension,
                typeFile: typeFile,
                extension: extension
            })

            setCssButton('pointer')
        } else {
            setResponse(responseFields)
            setFile(fileFields)
            setCssButton('not-allowed')
        }
    }

    const importFile = async () => {
        setIsLoader(true)
        setResponse(responseFields)

        try {
            const res = await api.post(`/upload-cnae`, { file })
            console.log('resp request', res.data)

            if (res.data) {
                setResponse({
                    isError: false,
                    text: res.data.message,
                    modalResponse: true
                })
            }

        } catch (error) {
            setResponse({
                isError: true,
                text: 'Error ao executar esta operação...' + error.response,
                modalResponse: true
            })
        } finally {
            setIsLoader(false)
            getTransactions()
        }
    }

    useEffect(() => { getTransactions() }, [])

    return (
        <>
            <div className="data">
                <div className="panel">
                    <section className="form-upload-file">
                        <label>
                            &nbsp;UPLOAD DE CNAB
                        </label>

                        <div className="row-forms" style={{ width: '100%', flexDirection: 'column' }}>
                            <div className="form-group" style={{
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '10px',
                                alignItems: 'baseline',
                                justifyContent: 'flex-start',

                            }}>
                                <label>Anexar CNAB↴</label>
                                <input
                                    type="file"
                                    name="file"
                                    style={{ marginBottom: 5, paddingLeft: 25 }}
                                    onChange={(e) => upload(e, 'nf')}
                                />
                            </div>

                            <div >
                                {
                                    response.isError ? <div><i className="fas fa-times red fa-2x" /></div>
                                        : <div><i className="far fa-check-circle green fa-2x" /></div>
                                }
                                <p>{response.text}</p>
                            </div>

                            {
                                file.hash_invoice !== '' ?
                                    <>
                                        <button
                                            onClick={() => importFile()}
                                            style={{ cursor: cssButton, marginBottom: 10, marginLeft: 35 }}
                                            type="button" className="btn btn-info"
                                        >
                                            <i className="la la-sign-out white la-lg" /> Importar
                                        </button>
                                    </>
                                    : <></>
                            }
                        </div>

                        <div>
                            <table className='table'>
                                <thead>
                                    <tr className='table-row'>
                                        <th className="table-row">ID</th>
                                        <th className="table-row">Dono da Loja</th>
                                        <th className="table-row">Nome da Loja</th>
                                        <th className="table-row">Tipo</th>
                                        <th className="table-row">Data</th>
                                        <th className="table-row">Valor</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {
                                        data.map((row, idx) =>
                                            <tr key={idx}>
                                                <td className="sorting_asc">{row.id}</td>
                                                {/* <td className="sorting_asc">{Moment(row.created_at).format('DD/MM/YYYY HH:mm:ss')}</td> */}
                                                <td className="sorting_asc">{row.owner}</td>
                                                <td className="sorting_asc">{row.name}</td>
                                                <td className="sorting_asc">{row.type}</td>
                                                <td className="sorting_asc">{Moment(row.date).format('DD/MM/YYYY')}</td>
                                                <td className="sorting_asc">R${utils.formatMoneyBRL(row.value)}</td>
                                            </tr>
                                        )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="form-upload-file">
                        <label>
                            &nbsp;SALDO POR LOJA
                        </label>

                        <div>
                            <table className='table'>
                                <thead>
                                    <tr className='table-row'>
                                        <th className="table-row">ID</th>
                                        <th className="table-row">Dono da Loja</th>
                                        <th className="table-row">Nome da Loja</th>
                                        <th className="table-row">Saldo</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {
                                        balance.map((row, idx) =>
                                            <tr key={idx}>
                                                <td className="sorting_asc">{row.id}</td>
                                                <td className="sorting_asc">{row.owner}</td>
                                                <td className="sorting_asc">{row.name}</td>
                                                <td className="sorting_asc">R${utils.formatMoneyBRL(row.balance_after_operation)}</td>
                                            </tr>
                                        )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </>
    )
}