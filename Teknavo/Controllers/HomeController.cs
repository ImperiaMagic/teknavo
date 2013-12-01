using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using Teknavo.Models;

namespace Teknavo.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public void SaveMatrix(string description, int dimension, IList<short> elements)
        {
            // description is used as an uniq identifier.
            // if we have already created Matrix with same description
            // all existing elements have to be deleted and new elemets will be added.
            
            DataFactory.CreateMatrix(description, dimension, elements);

            //return new JsonResult();
        }

        [HttpGet]
        public JsonResult GetMatrixList()
        {
            // function returns list of all matrices in data base
            // this data will be used to select in "List of Matrix" dialog
            var result = new JsonResult
                {
                    JsonRequestBehavior = JsonRequestBehavior.AllowGet,
                    Data = DataFactory.GetMatrixList().Select(m => new
                        {
                            id = m.MatrixId,
                            description = m.Description, 
                            dimension = m.Dimension
                        })
                };
            return result;
        }

        [HttpGet]
        public JsonResult GetElements(int matrixId, int lastLoadedIdx)
        {
            // function returns portion of elements 
            // starts from lastLoadedIdx
            var result = new JsonResult
            {
                JsonRequestBehavior = JsonRequestBehavior.AllowGet,
                Data = DataFactory.GetElements(matrixId, lastLoadedIdx).Select(e => new
                    {
                        index = e.Index,
                        value = e.Value
                    }
                )
            };
            return result;
        }

        [HttpGet]
        public void DeleteMatrix(int matrixId)
        {
            // function deletes matrix by id
            DataFactory.DeleteMatrix(matrixId);
        }
    }
}